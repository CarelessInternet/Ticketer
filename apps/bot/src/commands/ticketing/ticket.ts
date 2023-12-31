import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Colors,
	MessageType,
	ModalBuilder,
	PermissionFlagsBits,
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
import { categoryList, openingMessageEmbed } from '@/utils';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate('en-GB').commands.ticket.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.ticket.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.ticket.data.description'));

	@DeferReply(true)
	public async execute({ interaction }: Command.Context) {
		const list = await categoryList(
			super.customId('ticket_threads_categories_create_list'),
			interaction.locale,
			interaction.guildId,
		);

		return interaction.editReply({ components: [list] });
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.customId('ticket_threads_categories_create_list'),
		super.customId('ticket_threads_category_create_rename_title'),
		super.customId('ticket_threads_category_create_lock'),
		super.customId('ticket_threads_category_create_close'),
		super.customId('ticket_threads_category_create_delete'),
	];

	public execute({ interaction }: Component.Context<'string'>) {
		const baseTranslations = translate(interaction.locale).tickets.threads.categories;

		switch (interaction.customId) {
			case super.customId('ticket_threads_categories_create_list'): {
				const translations = baseTranslations.createModal;
				const id = interaction.values.at(0)!;

				const titleInput = new TextInputBuilder()
					.setCustomId('title')
					.setLabel(translations.title.label())
					.setRequired(true)
					.setMinLength(1)
					.setMaxLength(200)
					.setStyle(TextInputStyle.Short)
					.setPlaceholder(translations.title.placeholder());
				const descriptonInput = new TextInputBuilder()
					.setCustomId('description')
					.setLabel(translations.description.label())
					.setRequired(true)
					.setMinLength(1)
					.setMaxLength(2000)
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder(translations.description.placeholder());

				const titleRow = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
				const descriptionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptonInput);

				const modal = new ModalBuilder()
					.setCustomId(super.customId('ticket_threads_categories_create_ticket', id))
					.setTitle(translations.modalTitle())
					.setComponents(titleRow, descriptionRow);

				return interaction.showModal(modal);
			}
			default: {
				const translations = baseTranslations.createModal.errors.invalidCustomId;

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
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [super.dynamicCustomId('ticket_threads_categories_create_ticket')];

	@DeferUpdate
	public async execute({ interaction }: Modal.Context) {
		const { customId, fields, guild, guildId, guildLocale, locale, user } = interaction;
		const { dynamicValue } = super.extractCustomId(customId);
		const id = Number.parseInt(dynamicValue!);

		const translations = translate(locale).tickets.threads.categories.createTicket;
		const guildTranslations = translate(guildLocale).tickets.threads.categories.createTicket;

		if (Number.isNaN(id)) {
			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.errors.invalidId.title())
						.setDescription(translations.errors.invalidId.description()),
				],
			});
		}

		const [configuration] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(eq(ticketThreadsCategories.id, id))
			.innerJoin(ticketThreadsConfigurations, eq(ticketThreadsCategories.guildId, ticketThreadsConfigurations.guildId));

		if (!configuration) {
			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.errors.noConfiguration.title())
						.setDescription(translations.errors.noConfiguration.description()),
				],
			});
		}

		if (configuration.ticketThreadsCategories.managers.length <= 0) {
			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.errors.noManagers.title())
						.setDescription(translations.errors.noManagers.description()),
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
						.setTitle(translations.errors.invalidChannel.title())
						.setDescription(translations.errors.invalidChannel.description()),
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
						.setTitle(translations.errors.noPermissions.title())
						.setDescription(translations.errors.noPermissions.description({ permissions })),
				],
			});
		}

		const [result] = await database
			.select({ amount: count() })
			.from(ticketsThreads)
			.where(and(eq(ticketsThreads.authorId, user.id), eq(ticketsThreads.guildId, guildId)));

		if (result!.amount >= configuration.ticketThreadsConfigurations.activeTickets) {
			return interaction.editReply({
				components: [],
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.errors.tooManyTickets.title())
						.setDescription(
							translations.errors.tooManyTickets.description({
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

		await database.insert(ticketsThreads).values({ authorId: user.id, categoryId: id, guildId, threadId: thread.id });

		const messageEmbed = openingMessageEmbed({
			categoryTitle: configuration.ticketThreadsCategories.categoryTitle,
			description: configuration.ticketThreadsCategories.openingMessageDescription,
			embed: super.embed,
			locale: guildLocale,
			title: configuration.ticketThreadsCategories.openingMessageTitle,
			user,
		});
		const ticketEmbed = super.userEmbed(user).setColor(Colors.Green).setTitle(title).setDescription(description);

		const renameTitleButton = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_category_create_rename_title'))
			.setEmoji('📝')
			.setLabel(translations.buttons.renameTitle.label())
			.setStyle(ButtonStyle.Secondary);
		const lockButton = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_category_create_lock'))
			.setEmoji('🔐')
			.setLabel(translations.buttons.lock.label())
			.setStyle(ButtonStyle.Primary);
		const closeButton = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_category_create_close'))
			.setEmoji('🗃')
			.setLabel(translations.buttons.close.label())
			.setStyle(ButtonStyle.Success);
		const deleteButton = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_category_create_delete'))
			.setEmoji('🗑')
			.setLabel(translations.buttons.delete.label())
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

		if (!configuration.ticketThreadsCategories.threadNotifications) {
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
			.userEmbed(user)
			.setColor(Colors.Green)
			.setTitle(translations.ticketCreated.title())
			.setDescription(translations.ticketCreated.user.description({ channel: threadAsMention }));

		await interaction.editReply({ components: [], embeds: [ticketCreatedEmbed] });

		if (configuration.ticketThreadsCategories.logsChannelId) {
			const logsChannel = await guild.channels.fetch(configuration.ticketThreadsCategories.logsChannelId ?? '');

			if (!logsChannel?.isTextBased()) return;
			if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.SendMessages])) return;

			logsChannel.send({
				embeds: [
					ticketCreatedEmbed.setDescription(
						guildTranslations.ticketCreated.logs.description({
							channel: threadAsMention,
							member: userMention(user.id),
						}),
					),
				],
			});
		}
	}
}
