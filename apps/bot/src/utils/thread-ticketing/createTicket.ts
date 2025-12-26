import {
	and,
	database,
	eq,
	ticketsThreads,
	ticketThreadsCategories,
	ticketThreadsCategoriesSelectSchema,
	ticketThreadsConfigurations,
} from '@ticketer/database';
import {
	type Command,
	type Component,
	container,
	customId,
	dynamicCustomId,
	embed,
	extractCustomId,
	type Modal,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	type ButtonBuilder,
	ChannelType,
	Colors,
	ComponentType,
	inlineCode,
	MessageFlags,
	MessageType,
	PermissionFlagsBits,
	roleMention,
	type Snowflake,
	TextDisplayBuilder,
	ThreadAutoArchiveDuration,
} from 'discord.js';
import { prettifyError, z } from 'zod';
import { translate } from '@/i18n';
import { fetchChannel, threadTitle, ticketButtons, ticketThreadsOpeningMessageContainer } from '..';

interface CreateTicketOptions {
	categoryId?: typeof ticketThreadsCategories.$inferSelect.id;
	proxiedUserId?: Snowflake;
}

export async function createTicket(
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

					const { customId: id } = extractCustomId(component.customId);
					return (
						id === customId('ticket_threads_categories_create_list') ||
						id === dynamicCustomId('ticket_threads_categories_create_list_proxy')
					);
				}),
		);

	if (interaction.replied || hasComponents) {
		if ('deferUpdate' in interaction) await interaction.deferUpdate();
	} else {
		await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
	}

	const { createdAt, client, guild, guildId, guildLocale, locale, member: interactionMember } = interaction;
	const interactionCustomId = 'customId' in interaction ? interaction.customId : undefined;
	const fields = 'fields' in interaction ? interaction.fields : undefined;

	const dynamicValue = interactionCustomId ? extractCustomId(interactionCustomId, true).dynamicValue : undefined;
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
				userEmbedError({
					client,
					description: translations.createTicket.errors.invalidUser.description(),
					member: interactionMember,
					title: translations.createTicket.errors.invalidUser.title(),
				}),
			],
		});
	}

	if (!success) {
		return interaction.editReply({
			components: [],
			embeds: [
				userEmbedError({
					client,
					description: translations.createTicket.errors.invalidId.description(),
					member: interactionMember,
					title: translations.createTicket.errors.invalidId.title(),
				}),
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
				userEmbedError({
					client,
					description: translations.createTicket.errors.noConfiguration.description(),
					member: interactionMember,
					title: translations.createTicket.errors.noConfiguration.title(),
				}),
			],
		});
	}

	if (configuration.ticketThreadsCategories.managers.length <= 0) {
		return interaction.editReply({
			components: [],
			embeds: [
				userEmbedError({
					client,
					description: translations.createTicket.errors.noManagers.description(),
					member: interactionMember,
					title: translations.createTicket.errors.noManagers.title(),
				}),
			],
		});
	}

	const channel = await fetchChannel(guild, configuration.ticketThreadsCategories.channelId);

	if (channel?.type !== ChannelType.GuildText) {
		return interaction.editReply({
			components: [],
			embeds: [
				userEmbedError({
					client,
					description: translations.createTicket.errors.invalidChannel.description(),
					member: interactionMember,
					title: translations.createTicket.errors.invalidChannel.title(),
				}),
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
				PermissionFlagsBits.PinMessages,
				PermissionFlagsBits.ViewChannel,
				PermissionFlagsBits.SendMessagesInThreads,
				PermissionFlagsBits.EmbedLinks,
				isPrivate ? PermissionFlagsBits.CreatePrivateThreads : PermissionFlagsBits.CreatePublicThreads,
			])
	) {
		const permissions = inlineCode(
			[
				'Mention All Roles',
				'Manage Messages',
				'Pin Messages',
				'View Channel',
				'Send Messages in Threads',
				'Embed Links',
				`Create ${isPrivate ? 'Private' : 'Public'} Threads`,
			].join(', '),
		);

		return interaction.editReply({
			components: [],
			embeds: [
				userEmbedError({
					client,
					description: translations.createTicket.errors.noPermissions.description({ permissions }),
					member: interactionMember,
					title: translations.createTicket.errors.noPermissions.title(),
				}),
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
				userEmbedError({
					client,
					description: proxiedUser
						? translations.createTicket.errors.tooManyTickets.proxy.description({
								amount: configuration.ticketThreadsConfigurations.activeTickets,
								member: member.toString(),
							})
						: translations.createTicket.errors.tooManyTickets.user.description({
								amount: configuration.ticketThreadsConfigurations.activeTickets,
							}),
					member: interactionMember,
					title: translations.createTicket.errors.tooManyTickets.title(),
				}),
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
				userEmbedError({
					client,
					description: prettifyError(error),
					member: interactionMember,
					title: translations.createTicket.errors.invalidFields.title(),
				}),
			],
		});
	}

	const { description, title: userTitle } = data;
	const title = threadTitle({
		createdAt,
		member,
		threadTitle: configuration.ticketThreadsCategories.threadTitle,
		userTitle,
	});

	const thread = await channel.threads.create({
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
		invitable: false,
		name: title.slice(0, 100),
		type: isPrivate ? ChannelType.PrivateThread : ChannelType.PublicThread,
	});

	await database.insert(ticketsThreads).values({ authorId: member.id, categoryId, guildId, threadId: thread.id });

	const ticketEmbed = (proxiedUser ? embed({ client }) : userEmbed({ client, member })).setColor(Colors.Green);

	if (userTitle) {
		ticketEmbed.setTitle(userTitle);
	}

	if (description) {
		ticketEmbed.setDescription(description);
	}

	const buttons = ticketButtons({
		close: {
			customId: customId('ticket_threads_category_create_close'),
			label: guildTranslations.actions.close.builder.label(),
		},
		delete: {
			customId: customId('ticket_threads_category_create_delete'),
			label: guildTranslations.actions.delete.builder.label(),
		},
		lock: {
			customId: customId('ticket_threads_category_create_lock'),
			label: guildTranslations.actions.lock.builder.label(),
		},
		lockAndClose: {
			customId: customId('ticket_threads_category_create_lock_and_close'),
			label: guildTranslations.actions.lockAndClose.builder.label(),
		},
		renameTitle: {
			customId: customId('ticket_threads_category_create_rename_title'),
			label: guildTranslations.actions.renameTitle.builder.label(),
		},
	});

	const row1 = new ActionRowBuilder<ButtonBuilder>().setComponents(buttons.renameTitle, buttons.lock, buttons.close);
	const row2 = new ActionRowBuilder<ButtonBuilder>().setComponents(buttons.lockAndClose, buttons.delete);

	const initialMessage = await thread.send({
		allowedMentions: { roles: configuration.ticketThreadsCategories.managers },
		components: [row1, row2],
		content: configuration.ticketThreadsCategories.managers.map((roleId) => roleMention(roleId)).join(', '),
		...((title || description) && { embeds: [ticketEmbed] }),
		...(configuration.ticketThreadsCategories.silentPings && { flags: [MessageFlags.SuppressNotifications] }),
	});

	const messageContainer = container({
		builder: ticketThreadsOpeningMessageContainer({
			categoryEmoji: configuration.ticketThreadsCategories.categoryEmoji,
			categoryTitle: configuration.ticketThreadsCategories.categoryTitle,
			description: configuration.ticketThreadsCategories.openingMessageDescription,
			locale: guildLocale,
			member,
			title: configuration.ticketThreadsCategories.openingMessageTitle,
		}),
		client,
	});
	await thread.send({
		allowedMentions: { users: [member.id] },
		components: [new TextDisplayBuilder().setContent(member.toString()), messageContainer],
		flags: [MessageFlags.IsComponentsV2],
	});

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

	await initialMessage.pin();
	await thread.members.add(member);

	const ticketCreatedEmbed = userEmbed({ client, member: interactionMember })
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
					embed({ client })
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
