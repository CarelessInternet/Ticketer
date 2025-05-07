import type { BaseInteraction, Command, Component, Modal } from '@ticketer/djs-framework';

import {
	ChannelType,
	Colors,
	ComponentType,
	MessageFlags,
	MessageType,
	PermissionFlagsBits,
	type Snowflake,
	ThreadAutoArchiveDuration,
	inlineCode,
	roleMention,
} from 'discord.js';
import {
	and,
	database,
	eq,
	ticketThreadsCategories,
	ticketThreadsCategoriesSelectSchema,
	ticketThreadsConfigurations,
	ticketsThreads,
} from '@ticketer/database';
import { fetchChannel, formatDateShort, ticketButtons, ticketThreadsOpeningMessageEmbed, zodErrorToString } from '..';
import { translate } from '@/i18n';
import { z } from 'zod';

interface CreateTicketOptions {
	categoryId?: typeof ticketThreadsCategories.$inferSelect.id;
	proxiedUserId?: Snowflake;
}

export async function createTicket(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context | Component.Context | Modal.Context,
	{ categoryId: incomingCategoryId, proxiedUserId }: CreateTicketOptions = {},
) {
	// If the interaction has been replied to or the interaction message has the category select menu,
	// then defer the update instead of deferring the reply.
	const hasComponents =
		'message' in interaction &&
		interaction.message?.components.find(
			(row) =>
				row.type === ComponentType.ActionRow &&
				row.components.find((component) => {
					if (!component.customId) return false;

					const { customId } = this.extractCustomId(component.customId);
					return (
						customId === this.customId('ticket_threads_categories_create_list') ||
						customId === this.dynamicCustomId('ticket_threads_categories_create_list_proxy')
					);
				}),
		);

	if (interaction.replied || hasComponents) {
		if ('deferUpdate' in interaction) await interaction.deferUpdate();
	} else {
		await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
	}

	const { createdAt, client, guild, guildId, guildLocale, locale, member: interactionMember } = interaction;
	const customId = 'customId' in interaction ? interaction.customId : undefined;
	const fields = 'fields' in interaction ? interaction.fields : undefined;

	const dynamicValue = customId ? this.extractCustomId(customId, true).dynamicValue : undefined;
	const dynamicValues = dynamicValue?.split('_');
	const { data: categoryId, success } = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(
		Number(incomingCategoryId ?? dynamicValues?.at(0) ?? dynamicValue),
	);
	const proxiedUser = proxiedUserId ?? dynamicValues?.at(1);
	const member = await guild.members.fetch(proxiedUser ?? interactionMember);

	const translations = translate(locale).tickets.threads.categories;
	const guildTranslations = translate(guildLocale).tickets.threads.categories;

	if (member.id === client.user.id) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interactionMember, translations.createTicket.errors.invalidUser.title()).setDescription(
					translations.createTicket.errors.invalidUser.description(),
				),
			],
		});
	}

	if (!success) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interactionMember, translations.createTicket.errors.invalidId.title()).setDescription(
					translations.createTicket.errors.invalidId.description(),
				),
			],
		});
	}

	const [configuration] = await database
		.select()
		.from(ticketThreadsCategories)
		.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)))
		.innerJoin(ticketThreadsConfigurations, eq(ticketThreadsCategories.guildId, ticketThreadsConfigurations.guildId));

	if (!configuration) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interactionMember, translations.createTicket.errors.noConfiguration.title()).setDescription(
					translations.createTicket.errors.noConfiguration.description(),
				),
			],
		});
	}

	if (configuration.ticketThreadsCategories.managers.length <= 0) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interactionMember, translations.createTicket.errors.noManagers.title()).setDescription(
					translations.createTicket.errors.noManagers.description(),
				),
			],
		});
	}

	const channel = await fetchChannel(guild, configuration.ticketThreadsCategories.channelId);

	if (channel?.type !== ChannelType.GuildText) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interactionMember, translations.createTicket.errors.invalidChannel.title()).setDescription(
					translations.createTicket.errors.invalidChannel.description(),
				),
			],
		});
	}

	const me = await guild.members.fetchMe();
	const isPrivate = configuration.ticketThreadsCategories.privateThreads;

	if (
		!channel
			.permissionsFor(me)
			.has([
				PermissionFlagsBits.MentionEveryone,
				PermissionFlagsBits.ManageMessages,
				PermissionFlagsBits.ViewChannel,
				PermissionFlagsBits.SendMessagesInThreads,
				isPrivate ? PermissionFlagsBits.CreatePrivateThreads : PermissionFlagsBits.CreatePublicThreads,
			])
	) {
		const permissions = inlineCode(
			[
				'Mention All Roles',
				'Manage Messages',
				'View Channel',
				'Send Messages in Threads',
				`Create ${isPrivate ? 'Private' : 'Public'} Threads`,
			].join(', '),
		);

		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interactionMember, translations.createTicket.errors.noPermissions.title()).setDescription(
					translations.createTicket.errors.noPermissions.description({ permissions }),
				),
			],
		});
	}

	const globalTicketsAmount = await database.$count(
		ticketsThreads,
		and(
			eq(ticketsThreads.authorId, member.id),
			eq(ticketsThreads.guildId, guildId),
			eq(ticketsThreads.state, 'active'),
		),
	);

	if (globalTicketsAmount >= configuration.ticketThreadsConfigurations.activeTickets) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interactionMember, translations.createTicket.errors.tooManyTickets.title()).setDescription(
					proxiedUser
						? translations.createTicket.errors.tooManyTickets.proxy.description({
								amount: configuration.ticketThreadsConfigurations.activeTickets,
								member: member.toString(),
							})
						: translations.createTicket.errors.tooManyTickets.user.description({
								amount: configuration.ticketThreadsConfigurations.activeTickets,
							}),
				),
			],
		});
	}

	const {
		data,
		error,
		success: fieldsSuccess,
	} = z
		.object({
			title: z.string().min(0).max(100, translations.createTicket.errors.invalidFields.fields.title()),
			description: z.string().min(0).max(2000, translations.createTicket.errors.invalidFields.fields.description()),
		})
		.safeParse({
			title: fields?.getTextInputValue('title') ?? '',
			description: fields?.getTextInputValue('description') ?? '',
		});

	if (!fieldsSuccess) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interactionMember, translations.createTicket.errors.invalidFields.title()).setDescription(
					zodErrorToString(error),
				),
			],
		});
	}

	const { description, title } = data;
	const thread = await channel.threads.create({
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
		invitable: false,
		name: title || `[${formatDateShort(createdAt)}] ${member.displayName}`,
		type: isPrivate ? ChannelType.PrivateThread : ChannelType.PublicThread,
	});

	await database.insert(ticketsThreads).values({ authorId: member.id, categoryId, guildId, threadId: thread.id });

	const messageEmbed = ticketThreadsOpeningMessageEmbed({
		categoryEmoji: configuration.ticketThreadsCategories.categoryEmoji,
		categoryTitle: configuration.ticketThreadsCategories.categoryTitle,
		description: configuration.ticketThreadsCategories.openingMessageDescription,
		embed: this.embed,
		locale: guildLocale,
		member,
		title: configuration.ticketThreadsCategories.openingMessageTitle,
	});
	const ticketEmbed = (proxiedUser ? this.embed : this.userEmbed(member)).setColor(Colors.Green);

	if (title) {
		ticketEmbed.setTitle(title);
	}

	if (description) {
		ticketEmbed.setDescription(description);
	}

	const buttonsRow = ticketButtons({
		close: {
			customId: this.customId('ticket_threads_category_create_close'),
			label: guildTranslations.actions.close.builder.label(),
		},
		delete: {
			customId: this.customId('ticket_threads_category_create_delete'),
			label: guildTranslations.actions.delete.builder.label(),
		},
		lock: {
			customId: this.customId('ticket_threads_category_create_lock'),
			label: guildTranslations.actions.lock.builder.label(),
		},
		lockAndClose: {
			customId: this.customId('ticket_threads_category_create_lock_and_close'),
			label: guildTranslations.actions.lockAndClose.builder.label(),
		},
		renameTitle: {
			customId: this.customId('ticket_threads_category_create_rename_title'),
			label: guildTranslations.actions.renameTitle.builder.label(),
		},
	});

	const initialMessage = await thread.send({
		allowedMentions: { roles: configuration.ticketThreadsCategories.managers },
		components: buttonsRow,
		content: configuration.ticketThreadsCategories.managers.map((roleId) => roleMention(roleId)).join(', '),
		embeds: [messageEmbed, ...(title || description ? [ticketEmbed] : [])],
		...(configuration.ticketThreadsCategories.silentPings && { flags: [MessageFlags.SuppressNotifications] }),
	});

	await initialMessage.pin();

	if (
		!configuration.ticketThreadsCategories.threadNotifications &&
		!configuration.ticketThreadsCategories.privateThreads
	) {
		// Fetch because `channel.lastMessage` may not be cached and/or fall victim to race conditions.
		const lastMessages = await channel.messages.fetch({ limit: 1 });
		const latestMessage = lastMessages.at(0);

		if (latestMessage?.deletable && latestMessage.type === MessageType.ThreadCreated) {
			await latestMessage.delete();
		}
	}

	await thread.members.add(member);

	const ticketCreatedEmbed = this.userEmbed(interactionMember)
		.setColor(Colors.Green)
		.setTitle(translations.createTicket.ticketCreated.title())
		.setDescription(
			proxiedUser
				? translations.createTicket.ticketCreated.proxy.user.description({
						channel: thread.toString(),
						member: member.toString(),
					})
				: translations.createTicket.ticketCreated.notProxy.user.description({ channel: thread.toString() }),
		);

	await interaction.editReply({ components: [], embeds: [ticketCreatedEmbed] });

	if (configuration.ticketThreadsCategories.logsChannelId) {
		const logsChannel = await fetchChannel(guild, configuration.ticketThreadsCategories.logsChannelId);

		if (!logsChannel?.isTextBased()) return;
		if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]))
			return;

		await logsChannel.send({
			embeds: [
				ticketCreatedEmbed.setTitle(guildTranslations.createTicket.ticketCreated.title()).setDescription(
					proxiedUser
						? guildTranslations.createTicket.ticketCreated.proxy.logs.description({
								channel: thread.toString(),
								creator: interactionMember.toString(),
								member: member.toString(),
							})
						: guildTranslations.createTicket.ticketCreated.notProxy.logs.description({
								channel: thread.toString(),
								member: member.toString(),
							}),
				),
			],
		});
	}

	if (proxiedUser) {
		member
			.send({
				embeds: [
					this.embed
						.setTitle('Ticket Created by Proxy')
						.setDescription(
							`A ticketing manager created a support ticket for you in the "${
								guild.name
							}" server. View the ticket at ${thread.toString()}.`,
						),
				],
			})
			// Do nothing if the user cannot be sent direct messages.
			.catch(() => false);
	}
}
