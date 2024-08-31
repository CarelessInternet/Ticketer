import type { BaseInteraction, Modal } from '@ticketer/djs-framework';
import {
	ChannelType,
	Colors,
	MessageFlags,
	MessageType,
	PermissionFlagsBits,
	ThreadAutoArchiveDuration,
	inlineCode,
	roleMention,
} from 'discord.js';
import {
	and,
	count,
	database,
	eq,
	ticketThreadsCategories,
	ticketThreadsCategoriesSelectSchema,
	ticketThreadsConfigurations,
	ticketsThreads,
} from '@ticketer/database';
import { ticketButtons, ticketThreadsOpeningMessageEmbed, zodErrorToString } from '..';
import { translate } from '@/i18n';
import { z } from 'zod';

// TODO: Case 1: Modal (function below)
// Case 2: No modal
// On select menu click if there is one, immediately call the function below.

export async function createTicket(this: BaseInteraction.Interaction, { interaction }: Modal.Context) {
	// If the interaction has been replied to or the interaction message has the category select menu,
	// then defer the update instead of deferring the reply.
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	interaction.replied ||
	interaction.message?.components.find((row) =>
		row.components.find((component) => {
			if (!component.customId) return false;

			const { customId } = this.extractCustomId(component.customId);
			return (
				customId === this.customId('ticket_threads_categories_create_list') ||
				customId === this.dynamicCustomId('ticket_threads_categories_create_list_proxy')
			);
		}),
	)
		? await interaction.deferUpdate()
		: await interaction.deferReply({ ephemeral: true });

	const { client, customId, fields, guild, guildId, guildLocale, locale, user: interactionUser } = interaction;
	const { dynamicValue } = this.extractCustomId(customId, true);
	const dynamicValues = dynamicValue.split('_');
	const { data: categoryId, success } = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(
		Number(dynamicValues.at(0) ?? dynamicValue),
	);
	const isProxied = !!dynamicValues.at(1);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const user = isProxied ? await this.client.users.fetch(dynamicValues.at(1)!) : interactionUser;

	const translations = translate(locale).tickets.threads.categories;
	const guildTranslations = translate(guildLocale).tickets.threads.categories;

	if (user.id === client.user.id) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(user, translations.createTicket.errors.invalidUser.title()).setDescription(
					translations.createTicket.errors.invalidUser.description(),
				),
			],
		});
	}

	if (!success) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(user, translations.createTicket.errors.invalidId.title()).setDescription(
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
				this.userEmbedError(user, translations.createTicket.errors.noConfiguration.title()).setDescription(
					translations.createTicket.errors.noConfiguration.description(),
				),
			],
		});
	}

	if (configuration.ticketThreadsCategories.managers.length <= 0) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(user, translations.createTicket.errors.noManagers.title()).setDescription(
					translations.createTicket.errors.noManagers.description(),
				),
			],
		});
	}

	const channel = await guild.channels.fetch(configuration.ticketThreadsCategories.channelId ?? '');

	if (!channel || channel.type !== ChannelType.GuildText) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(user, translations.createTicket.errors.invalidChannel.title()).setDescription(
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
				this.userEmbedError(user, translations.createTicket.errors.noPermissions.title()).setDescription(
					translations.createTicket.errors.noPermissions.description({ permissions }),
				),
			],
		});
	}

	const [result] = await database
		.select({ amount: count() })
		.from(ticketsThreads)
		.where(
			and(
				eq(ticketsThreads.authorId, user.id),
				eq(ticketsThreads.guildId, guildId),
				eq(ticketsThreads.state, 'active'),
			),
		);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	if (result!.amount >= configuration.ticketThreadsConfigurations.activeTickets) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(user, translations.createTicket.errors.tooManyTickets.title()).setDescription(
					isProxied
						? translations.createTicket.errors.tooManyTickets.proxy.description({
								amount: configuration.ticketThreadsConfigurations.activeTickets,
								member: user.toString(),
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
			title: fields.getTextInputValue('title'),
			description: fields.getTextInputValue('description'),
		});

	if (!fieldsSuccess) {
		return interaction.editReply({
			components: [],
			embeds: [
				this.userEmbedError(interaction.user, translations.createTicket.errors.invalidFields.title()).setDescription(
					zodErrorToString(error),
				),
			],
		});
	}

	const { description, title } = data;
	const thread = await channel.threads.create({
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
		invitable: false,
		name: title || user.displayName,
		type: isPrivate ? ChannelType.PrivateThread : ChannelType.PublicThread,
	});

	await database.insert(ticketsThreads).values({ authorId: user.id, categoryId, guildId, threadId: thread.id });

	const messageEmbed = ticketThreadsOpeningMessageEmbed({
		categoryTitle: configuration.ticketThreadsCategories.categoryTitle,
		description: configuration.ticketThreadsCategories.openingMessageDescription,
		embed: this.embed,
		locale: guildLocale,
		title: configuration.ticketThreadsCategories.openingMessageTitle,
		user,
	});
	const ticketEmbed = (isProxied ? this.embed : this.userEmbed(user)).setColor(Colors.Green);

	if (title) {
		ticketEmbed.setTitle(title);
	}

	if (description) {
		ticketEmbed.setDescription(description);
	}

	const buttonsRow = ticketButtons({
		close: {
			customId: this.customId('ticket_threads_category_create_close'),
			label: guildTranslations.buttons.close.builder.label(),
		},
		delete: {
			customId: this.customId('ticket_threads_category_create_delete'),
			label: guildTranslations.buttons.delete.builder.label(),
		},
		lock: {
			customId: this.customId('ticket_threads_category_create_lock'),
			label: guildTranslations.buttons.lock.builder.label(),
		},
		lockAndClose: {
			customId: this.customId('ticket_threads_category_create_lock_and_close'),
			label: guildTranslations.buttons.lockAndClose.builder.label(),
		},
		renameTitle: {
			customId: this.customId('ticket_threads_category_create_rename_title'),
			label: guildTranslations.buttons.renameTitle.builder.label(),
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

	await thread.members.add(user);

	const ticketCreatedEmbed = this.userEmbed(isProxied ? interactionUser : user)
		.setColor(Colors.Green)
		.setTitle(translations.createTicket.ticketCreated.title())
		.setDescription(
			isProxied
				? translations.createTicket.ticketCreated.proxy.user.description({
						channel: thread.toString(),
						member: user.toString(),
					})
				: translations.createTicket.ticketCreated.notProxy.user.description({ channel: thread.toString() }),
		);

	await interaction.editReply({ components: [], embeds: [ticketCreatedEmbed] });

	if (configuration.ticketThreadsCategories.logsChannelId) {
		const logsChannel = await guild.channels.fetch(configuration.ticketThreadsCategories.logsChannelId);

		if (!logsChannel?.isTextBased()) return;
		if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]))
			return;

		await logsChannel.send({
			embeds: [
				ticketCreatedEmbed.setTitle(guildTranslations.createTicket.ticketCreated.title()).setDescription(
					isProxied
						? guildTranslations.createTicket.ticketCreated.proxy.logs.description({
								channel: thread.toString(),
								creator: interactionUser.toString(),
								member: user.toString(),
							})
						: guildTranslations.createTicket.ticketCreated.notProxy.logs.description({
								channel: thread.toString(),
								member: user.toString(),
							}),
				),
			],
		});
	}

	if (isProxied) {
		user
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
