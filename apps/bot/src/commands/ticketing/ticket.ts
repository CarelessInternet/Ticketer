import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Colors,
	MessageType,
	ModalBuilder,
	PermissionFlagsBits,
	type Snowflake,
	TextInputBuilder,
	TextInputStyle,
	ThreadAutoArchiveDuration,
	channelMention,
	inlineCode,
	roleMention,
	userMention,
} from 'discord.js';
import { Command, Component, DeferReply, DeferUpdate, Modal } from '@ticketer/djs-framework';
import {
	and,
	count,
	database,
	eq,
	ticketThreadsCategories,
	ticketThreadsConfigurations,
	ticketsThreads,
} from '@ticketer/database';
import { categoryList, closeTicket, deleteTicket, lockTicket, openingMessageEmbed, renameTitle } from '@/utils';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate('en-GB').commands.ticket.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.ticket.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.ticket.data.description'));

	@DeferReply(true)
	public async execute({ interaction }: Command.Context) {
		const list = await categoryList({
			customId: super.customId('ticket_threads_categories_create_list_command'),
			guildId: interaction.guildId,
			locale: interaction.locale,
		});

		return interaction.editReply({ components: [list] });
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.customId('ticket_threads_categories_create_list_command'),
		super.dynamicCustomId('ticket_threads_categories_create_list_proxy'),
		super.customId('ticket_threads_categories_create_list_panel'),
		super.customId('ticket_threads_category_create_rename_title'),
		super.customId('ticket_threads_category_create_lock'),
		super.customId('ticket_threads_category_create_close'),
		super.customId('ticket_threads_category_create_delete'),
	];

	public execute(context: Component.Context) {
		const { customId, dynamicValue } = super.extractCustomId(context.interaction.customId);

		switch (customId) {
			case super.customId('ticket_threads_categories_create_list_command'):
			case super.dynamicCustomId('ticket_threads_categories_create_list_proxy'): {
				return (
					context.interaction.isStringSelectMenu() &&
					this.ticketModal({ interaction: context.interaction }, dynamicValue)
				);
			}
			case super.customId('ticket_threads_categories_create_list_panel'): {
				return context.interaction.isButton() && this.panelTicketModal(context);
			}
			case super.customId('ticket_threads_category_create_rename_title'): {
				void renameTitle.call(this, context);
				return;
			}
			case super.customId('ticket_threads_category_create_lock'): {
				void this.lockTicket(context);
				return;
			}
			case super.customId('ticket_threads_category_create_close'): {
				void this.closeTicket(context);
				return;
			}
			case super.customId('ticket_threads_category_create_delete'): {
				void this.deleteTicket(context);
				return;
			}
			default: {
				const translations = translate(context.interaction.locale).tickets.threads.categories.createModal.errors
					.invalidCustomId;

				return context.interaction.reply({
					embeds: [
						super
							.userEmbedError(context.interaction.user)
							.setTitle(translations.title())
							.setDescription(translations.description()),
					],
					ephemeral: true,
				});
			}
		}
	}

	private ticketModal({ interaction }: Component.Context<'string'>, userId?: Snowflake) {
		const translations = translate(interaction.locale).tickets.threads.categories.createModal;
		const id = interaction.values.at(0);

		const titleInput = new TextInputBuilder()
			.setCustomId(super.customId('title'))
			.setLabel(translations.title.label())
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(200)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder(translations.title.placeholder());
		const descriptonInput = new TextInputBuilder()
			.setCustomId(super.customId('description'))
			.setLabel(translations.description.label())
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(2000)
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder(translations.description.placeholder());

		const titleRow = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
		const descriptionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptonInput);

		const modal = new ModalBuilder()
			.setCustomId(super.customId('ticket_threads_categories_create_ticket', userId ? `${id}_${userId}` : id))
			.setTitle(translations.modalTitle())
			.setComponents(titleRow, descriptionRow);

		return interaction.showModal(modal);
	}

	@DeferReply(true)
	private async panelTicketModal({ interaction }: Component.Context) {
		const list = await categoryList({
			customId: super.customId('ticket_threads_categories_create_list_command'),
			guildId: interaction.guildId,
			locale: interaction.locale,
		});

		return interaction.editReply({ components: [list] });
	}

	@DeferReply(true)
	private lockTicket(context: Component.Context) {
		return lockTicket.call(this, context);
	}

	@DeferReply(true)
	private closeTicket(context: Component.Context) {
		return closeTicket.call(this, context);
	}

	@DeferReply(true)
	private deleteTicket(context: Component.Context) {
		return deleteTicket.call(this, context);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_threads_categories_create_ticket'),
		super.customId('ticket_threads_categories_create_rename_title_modal'),
	];

	public async execute({ interaction }: Modal.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.dynamicCustomId('ticket_threads_categories_create_ticket'): {
				return this.ticketCreation({ interaction });
			}
			case super.customId('ticket_threads_categories_create_rename_title_modal'): {
				return this.renameTitle({ interaction });
			}
			default: {
				const translations = translate(interaction.locale).tickets.threads.categories.createModal.errors
					.invalidCustomId;

				return interaction.reply({
					embeds: [
						super
							.userEmbedError(interaction.user)
							.setTitle(translations.title())
							.setDescription(translations.description()),
					],
					ephemeral: true,
				});
			}
		}
	}

	@DeferUpdate
	private async ticketCreation({ interaction }: Modal.Context) {
		const { customId, fields, guild, guildId, guildLocale, locale, user: interactionUser } = interaction;
		const { dynamicValue } = super.extractCustomId(customId, true);
		const dynamicValues = dynamicValue.split('_');
		const categoryId = Number.parseInt(dynamicValues.at(0) ?? dynamicValue);
		const isProxied = !!dynamicValues.at(1);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const user = isProxied ? await this.client.users.fetch(dynamicValues.at(1)!) : interactionUser;

		const translations = translate(locale).tickets.threads.categories;
		const guildTranslations = translate(guildLocale).tickets.threads.categories;

		if (Number.isNaN(categoryId)) {
			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.createTicket.errors.invalidId.title())
						.setDescription(translations.createTicket.errors.invalidId.description()),
				],
			});
		}

		const [configuration] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(eq(ticketThreadsCategories.id, categoryId))
			.innerJoin(ticketThreadsConfigurations, eq(ticketThreadsCategories.guildId, ticketThreadsConfigurations.guildId));

		if (!configuration) {
			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.createTicket.errors.noConfiguration.title())
						.setDescription(translations.createTicket.errors.noConfiguration.description()),
				],
			});
		}

		if (configuration.ticketThreadsCategories.managers.length <= 0) {
			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.createTicket.errors.noManagers.title())
						.setDescription(translations.createTicket.errors.noManagers.description()),
				],
			});
		}

		const channel = await guild.channels.fetch(configuration.ticketThreadsCategories.channelId ?? '');

		if (!channel || channel.type !== ChannelType.GuildText) {
			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.createTicket.errors.invalidChannel.title())
						.setDescription(translations.createTicket.errors.invalidChannel.description()),
				],
			});
		}

		const me = await guild.members.fetchMe();
		const isPrivate = configuration.ticketThreadsCategories.privateThreads;

		if (
			!channel
				.permissionsFor(me)
				.has([
					PermissionFlagsBits.ManageMessages,
					PermissionFlagsBits.SendMessagesInThreads,
					isPrivate ? PermissionFlagsBits.CreatePrivateThreads : PermissionFlagsBits.CreatePublicThreads,
				])
		) {
			const permissions = inlineCode(
				['Manage Messages', 'Send Messages in Threads', `Create ${isPrivate ? 'Private' : 'Public'} Threads`].join(
					', ',
				),
			);

			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.createTicket.errors.noPermissions.title())
						.setDescription(translations.createTicket.errors.noPermissions.description({ permissions })),
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
					super
						.userEmbedError(user)
						.setTitle(translations.createTicket.errors.tooManyTickets.title())
						.setDescription(
							isProxied
								? translations.createTicket.errors.tooManyTickets.proxy.description({
										amount: configuration.ticketThreadsConfigurations.activeTickets,
										member: userMention(user.id),
									})
								: translations.createTicket.errors.tooManyTickets.user.description({
										amount: configuration.ticketThreadsConfigurations.activeTickets,
									}),
						),
				],
			});
		}

		const title = fields.getTextInputValue('title');
		const description = fields.getTextInputValue('description');

		const thread = await channel.threads.create({
			autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
			invitable: false,
			name: title,
			type: isPrivate ? ChannelType.PrivateThread : ChannelType.PublicThread,
		});

		await database.insert(ticketsThreads).values({ authorId: user.id, categoryId, guildId, threadId: thread.id });

		const messageEmbed = openingMessageEmbed({
			categoryTitle: configuration.ticketThreadsCategories.categoryTitle,
			description: configuration.ticketThreadsCategories.openingMessageDescription,
			embed: super.embed,
			locale: guildLocale,
			title: configuration.ticketThreadsCategories.openingMessageTitle,
			user,
		});
		const ticketEmbed = (isProxied ? super.embed : super.userEmbed(user))
			.setColor(Colors.Green)
			.setTitle(title)
			.setDescription(description);

		const renameTitleButton = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_category_create_rename_title'))
			.setEmoji('📝')
			.setLabel(guildTranslations.buttons.renameTitle.builder.label())
			.setStyle(ButtonStyle.Secondary);
		const lockButton = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_category_create_lock'))
			.setEmoji('🔐')
			.setLabel(guildTranslations.buttons.lock.builder.label())
			.setStyle(ButtonStyle.Primary);
		const closeButton = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_category_create_close'))
			.setEmoji('🗃')
			.setLabel(guildTranslations.buttons.close.builder.label())
			.setStyle(ButtonStyle.Success);
		const deleteButton = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_category_create_delete'))
			.setEmoji('🗑')
			.setLabel(guildTranslations.buttons.delete.builder.label())
			.setStyle(ButtonStyle.Danger);

		const buttonRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
			renameTitleButton,
			lockButton,
			closeButton,
			deleteButton,
		);

		const initialMessage = await thread.send({
			allowedMentions: { roles: configuration.ticketThreadsCategories.managers },
			components: [buttonRow],
			content: configuration.ticketThreadsCategories.managers.map((roleId) => roleMention(roleId)).join(', '),
			embeds: [messageEmbed, ticketEmbed],
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

		const threadAsMention = channelMention(thread.id);
		const ticketCreatedEmbed = super
			.userEmbed(isProxied ? interactionUser : user)
			.setColor(Colors.Green)
			.setTitle(translations.createTicket.ticketCreated.title())
			.setDescription(
				isProxied
					? translations.createTicket.ticketCreated.proxy.user.description({
							channel: threadAsMention,
							member: userMention(user.id),
						})
					: translations.createTicket.ticketCreated.notProxy.user.description({ channel: threadAsMention }),
			);

		await interaction.editReply({ components: [], embeds: [ticketCreatedEmbed] });

		if (configuration.ticketThreadsCategories.logsChannelId) {
			const logsChannel = await guild.channels.fetch(configuration.ticketThreadsCategories.logsChannelId);

			if (!logsChannel?.isTextBased()) return;
			if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.SendMessages])) return;

			await logsChannel.send({
				embeds: [
					ticketCreatedEmbed.setTitle(guildTranslations.createTicket.ticketCreated.title()).setDescription(
						isProxied
							? guildTranslations.createTicket.ticketCreated.proxy.logs.description({
									channel: threadAsMention,
									creator: userMention(interactionUser.id),
									member: userMention(user.id),
								})
							: guildTranslations.createTicket.ticketCreated.notProxy.logs.description({
									channel: threadAsMention,
									member: userMention(user.id),
								}),
					),
				],
			});
		}

		if (isProxied) {
			user
				.send({
					embeds: [
						super.embed
							.setTitle('Ticket Created by Proxy')
							.setDescription(
								`A ticketing manager created a support ticket for you in the "${guild.name}" server. View the ticket at ${threadAsMention}.`,
							),
					],
				})
				// Do nothing if the user cannot be sent direct messages.
				.catch(() => false);
		}
	}

	@DeferReply(true)
	private async renameTitle({ interaction }: Modal.Context) {
		const { channel, fields, guild, guildLocale, locale, member, user } = interaction;
		const translations = translate(locale).tickets.threads.categories.buttons;

		if (channel?.type !== ChannelType.PrivateThread && channel?.type !== ChannelType.PublicThread) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations._errorIfNotTicketChannel.title())
						.setDescription(translations._errorIfNotTicketChannel.description()),
				],
			});
		}

		if (!channel.editable) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.renameTitle.modal.errors.notEditable.title())
						.setDescription(translations.renameTitle.modal.errors.notEditable.description()),
				],
			});
		}

		const [row] = await database
			.select({
				authorId: ticketsThreads.authorId,
				logsChannelId: ticketThreadsCategories.logsChannelId,
				managers: ticketThreadsCategories.managers,
			})
			.from(ticketsThreads)
			.where(eq(ticketsThreads.threadId, channel.id))
			.leftJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));

		if (row?.authorId !== user.id && !row?.managers?.some((id) => member.roles.resolve(id))) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations._errorIfNotTicketAuthorOrManager.title())
						.setDescription(translations._errorIfNotTicketAuthorOrManager.description()),
				],
			});
		}

		const oldTitle = channel.name;
		const newTitle = fields.getTextInputValue('title');
		const successTranslations = translations.renameTitle.modal.success;
		const guildSuccessTranslations =
			translate(guildLocale).tickets.threads.categories.buttons.renameTitle.modal.success;
		const embed = super
			.userEmbed(user)
			.setColor(Colors.DarkGreen)
			.setTitle(successTranslations.title())
			.setDescription(successTranslations.user.description({ oldTitle, newTitle }));

		await channel.edit({ name: newTitle });
		await interaction.editReply({
			embeds: [embed],
		});

		if (row.logsChannelId) {
			const me = await guild.members.fetchMe();
			const logsChannel = await guild.channels.fetch(row.logsChannelId);

			if (!logsChannel?.isTextBased()) return;
			if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.SendMessages])) return;

			void logsChannel.send({
				embeds: [
					embed
						.setTitle(guildSuccessTranslations.title())
						.setDescription(
							guildSuccessTranslations.logs.description({ oldTitle, newTitle, thread: channelMention(channel.id) }),
						),
				],
			});
		}
	}
}
