import { asc, database, eq, ticketThreadsCategories, ticketThreadsConfigurations } from '@ticketer/database';
import {
	type BaseInteraction,
	type Command,
	type Component,
	container,
	customId,
	userEmbedError,
} from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	bold,
	channelMention,
	HeadingLevel,
	heading,
	inlineCode,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	roleMention,
	SeparatorBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { messageWithPagination, ThreadTicketing, ticketThreadsOpeningMessageContainer, withPagination } from '@/utils';

const CATEGORY_PAGE_SIZE = 2;

export function HasGlobalConfiguration(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = async function (this: BaseInteraction.Interaction, { interaction }: BaseInteraction.Context) {
		if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			const [row] = await database
				.select()
				.from(ticketThreadsConfigurations)
				.where(eq(ticketThreadsConfigurations.guildId, interaction.guildId));

			if (!row) {
				const embed = userEmbedError({
					client: interaction.client,
					description: 'Please create a global thread ticket configuration before creating categories.',
					member: interaction.member,
				});

				return interaction.deferred
					? interaction.editReply({
							embeds: [embed],
						})
					: interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
			}
		}

		// biome-ignore lint/complexity/noArguments: It is convenient.
		return Reflect.apply(original, this, arguments) as () => unknown;
	};

	return descriptor;
}

export function categoryViewContainers(
	{ interaction }: Command.Context | Component.Context,
	categories: (typeof ticketThreadsCategories.$inferSelect)[],
) {
	return categories.map((category) =>
		container({
			builder: (cont) =>
				ticketThreadsOpeningMessageContainer({
					categoryEmoji: category.categoryEmoji,
					categoryTitle: category.categoryTitle,
					description: category.openingMessageDescription,
					container: cont
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								heading(
									`Channel: ${category.channelId ? channelMention(category.channelId) : 'None'}`,
									HeadingLevel.One,
								),
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Ticket')} Managers: ${category.managers.length > 0 ? category.managers.map((id) => roleMention(id)).join(', ') : 'None'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Logs Channel')}: ${category.logsChannelId ? channelMention(category.logsChannelId) : 'None'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Allowed Author Actions')}: ${ThreadTicketing.actionsBitfieldToNames(
									category.allowedAuthorActions,
								)
									.map((name) => inlineCode(name))
									.join(', ')}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Private Threads')}: ${category.privateThreads ? 'Enabled' : 'Disabled'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Silent Pings')}: ${category.silentPings ? 'Enabled' : 'Disabled'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Skip Modal')}: ${category.skipModal ? 'Enabled' : 'Disabled'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Thread Notifications')}: ${category.threadNotifications ? 'Enabled' : 'Disabled'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Ticket Title & Description')}: ${category.titleAndDescriptionRequired ? 'Required' : 'Optional'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)),
						)
						.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
					locale: interaction.guildLocale,
					member: interaction.member,
					title: category.openingMessageTitle,
				}),
			client: interaction.client,
		}),
	);
}

export async function getCategories(context: Command.Context | Component.Context, page = 0) {
	const categories = await withPagination({
		page,
		pageSize: CATEGORY_PAGE_SIZE,
		query: database
			.select()
			.from(ticketThreadsCategories)
			.where(eq(ticketThreadsCategories.guildId, context.interaction.guildId))
			.orderBy(asc(ticketThreadsCategories.id))
			.$dynamic(),
	});

	const containers = categoryViewContainers(context, categories);
	const pagination = messageWithPagination({
		previous: { customId: customId('ticket_threads_category_view_previous', page), disabled: page === 0 },
		next: {
			customId: customId('ticket_threads_category_view_next', page),
			disabled: categories.length < CATEGORY_PAGE_SIZE,
		},
	});

	return context.interaction.editReply({
		allowedMentions: { parse: [] },
		components: [...containers, ...pagination],
		flags: [MessageFlags.IsComponentsV2],
	});
}

export async function categoryFieldsModal(
	context: Command.Context | Component.Context,
	options?: { id?: string | number; emoji?: string | null; title?: string; description?: string },
) {
	const emojiInput = new LabelBuilder()
		.setLabel('Emoji')
		.setDescription('Write an emoji to be used for the category.')
		.setTextInputComponent(
			(options?.emoji ? new TextInputBuilder().setValue(options.emoji) : new TextInputBuilder())
				.setCustomId(customId('emoji'))
				.setRequired(false)
				.setMinLength(1)
				.setMaxLength(21)
				.setStyle(TextInputStyle.Short),
		);
	const titleInput = new LabelBuilder()
		.setLabel('Title')
		.setDescription('Write the title to be used for the category.')
		.setTextInputComponent(
			(options?.title ? new TextInputBuilder().setValue(options.title) : new TextInputBuilder())
				.setCustomId(customId('title'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(100)
				.setStyle(TextInputStyle.Short),
		);
	const descriptionInput = new LabelBuilder()
		.setLabel('Description')
		.setDescription('Write the description to be used for the category.')
		.setTextInputComponent(
			(options?.description ? new TextInputBuilder().setValue(options.description) : new TextInputBuilder())
				.setCustomId(customId('description'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(100)
				.setStyle(TextInputStyle.Paragraph),
		);

	const modal = new ModalBuilder()
		.setCustomId(customId(`ticket_threads_category_fields${options?.id ? '_dynamic' : ''}`, options?.id))
		.setTitle('Category Emoji, Title, & Description')
		.setLabelComponents(emojiInput, titleInput, descriptionInput);

	return context.interaction.showModal(modal).catch(() => false);
}

export function configurationMenu(categoryId: number) {
	const categoriesMenu = new StringSelectMenuBuilder()
		.setCustomId(customId('ticket_threads_category_configuration', categoryId))
		.setMinValues(1)
		.setMaxValues(1)
		.setPlaceholder('Edit one of the following ticket category options:')
		.setOptions(
			new StringSelectMenuOptionBuilder()
				.setEmoji('📰')
				.setLabel('Emoji, Title, & Description')
				.setDescription('Change the emoji, title, and description used for this category.')
				.setValue('emoji_title_description'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('🛡️')
				.setLabel('Ticket Managers')
				.setDescription('Choose the managers who are responsible for this category.')
				.setValue('managers'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('#️⃣')
				.setLabel('Channel')
				.setDescription('Change the channel where tickets of this category go.')
				.setValue('channel'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📜')
				.setLabel('Logs Channel')
				.setDescription('Change the channel where logs get sent during ticket activity for the category.')
				.setValue('logs_channel'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📔')
				.setLabel('Message Title & Description')
				.setDescription("Change the opening message's title and description.")
				.setValue('message_title_description'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('🚦')
				.setLabel('Allowed Author Actions')
				.setDescription('Change what actions the ticket author can use.')
				.setValue('allowed_author_actions'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('👋')
				.setLabel('Author Leave Action')
				.setDescription('Change the action to perform when the ticket author leaves the thread.')
				.setValue('author_leave_action'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('🛃')
				.setLabel('Private Thread')
				.setDescription('Toggle whether the tickets are private.')
				.setValue('private'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('🔔')
				.setLabel('Silent Pings')
				.setDescription('Toggle whether managers get pinged (with noise) on ticket creation.')
				.setValue('silent_pings'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('⏩')
				.setLabel('Skip Modal')
				.setDescription('Toggle whether modals are skipped.')
				.setValue('skip_modals'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📣')
				.setLabel('Thread Notification')
				.setDescription('Toggle whether the new thread system message stays on.')
				.setValue('notification'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📑')
				.setLabel('Thread Title')
				.setDescription("Edit the created thread's title.")
				.setValue('thread_title'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📝')
				.setLabel('Title & Description')
				.setDescription('Toggle whether ticket authors must write a title and description.')
				.setValue('ticket_title_description'),
		);

	return [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(categoriesMenu)];
}
