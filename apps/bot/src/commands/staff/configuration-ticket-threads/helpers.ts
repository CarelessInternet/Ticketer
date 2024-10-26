import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	channelMention,
	inlineCode,
	roleMention,
} from 'discord.js';
import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import {
	ThreadTicketing,
	messageWithPagination,
	ticketThreadsOpeningMessageDescription,
	ticketThreadsOpeningMessageTitle,
	withPagination,
} from '@/utils';
import { asc, database, eq, ticketThreadsCategories, ticketThreadsConfigurations } from '@ticketer/database';

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
				const embed = this.userEmbedError(interaction.member).setDescription(
					'Please create a global thread ticket configuration before creating categories.',
				);

				return interaction.deferred
					? interaction.editReply({
							embeds: [embed],
						})
					: interaction.reply({ embeds: [embed], ephemeral: true });
			}
		}

		// eslint-disable-next-line prefer-rest-params
		return Reflect.apply(original, this, arguments) as () => unknown;
	};

	return descriptor;
}

function categoryViewEmbed(
	this: BaseInteraction.Interaction,
	context: Command.Context | Component.Context,
	categories: (typeof ticketThreadsCategories.$inferSelect)[],
) {
	return categories.map((category) =>
		this.embed
			.setTitle(ThreadTicketing.titleAndEmoji(category.categoryTitle, category.categoryEmoji))
			.setDescription(category.categoryDescription)
			.setFields(
				{
					name: 'Category Channel',
					value: category.channelId ? channelMention(category.channelId) : 'None',
					inline: true,
				},
				{
					name: 'Logs Channel',
					value: category.logsChannelId ? channelMention(category.logsChannelId) : 'None',
					inline: true,
				},
				{
					name: 'Ticket Managers',
					value: category.managers.length > 0 ? category.managers.map((id) => roleMention(id)).join(', ') : 'None',
					inline: true,
				},
				{
					name: '\u200B',
					value: '\u200B',
				},
				{
					name: 'Opening Message Title',
					value: ticketThreadsOpeningMessageTitle({
						categoryEmoji: category.categoryEmoji,
						categoryTitle: category.categoryTitle,
						displayName: context.interaction.member.displayName,
						locale: context.interaction.locale,
						title: category.openingMessageTitle,
					}),
					inline: true,
				},
				{
					name: 'Opening Message Description',
					value: ticketThreadsOpeningMessageDescription({
						categoryTitle: category.categoryTitle,
						description: category.openingMessageDescription,
						locale: context.interaction.locale,
						memberMention: context.interaction.member.toString(),
					}),
					inline: true,
				},
				{
					name: 'Allowed Author Actions',
					value: ThreadTicketing.actionsBitfieldToNames(category.allowedAuthorActions)
						.map((name) => inlineCode(name))
						.join(', '),
				},
				{
					name: '\u200B',
					value: '\u200B',
				},
				{
					name: 'Private Threads',
					value: category.privateThreads ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Silent Pings',
					value: category.silentPings ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Skip Modal',
					value: category.skipModal ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Thread Notifications',
					value: category.threadNotifications ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Ticket Title & Description',
					value: category.titleAndDescriptionRequired ? 'Required' : 'Optional',
					inline: true,
				},
			),
	);
}

export async function getCategories(
	this: BaseInteraction.Interaction,
	context: Command.Context | Component.Context,
	page = 0,
) {
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

	const embeds = categoryViewEmbed.call(this, context, categories);
	const components = messageWithPagination({
		previous: { customId: this.customId('ticket_threads_category_view_previous', page), disabled: page === 0 },
		next: {
			customId: this.customId('ticket_threads_category_view_next', page),
			disabled: categories.length < CATEGORY_PAGE_SIZE,
		},
	});

	return context.interaction.editReply({ components, embeds });
}

export function categoryFieldsModal(
	this: BaseInteraction.Interaction,
	context: Command.Context | Component.Context,
	options?: { id?: string | number; emoji?: string | null; title?: string; description?: string },
) {
	const emojiInput = (options?.emoji ? new TextInputBuilder().setValue(options.emoji) : new TextInputBuilder())
		.setCustomId(this.customId('emoji'))
		.setLabel('Emoji')
		.setRequired(false)
		.setMinLength(1)
		// 8 because of unicode.
		.setMaxLength(8)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('Write an emoji to be used for the category.');
	const titleInput = (options?.title ? new TextInputBuilder().setValue(options.title) : new TextInputBuilder())
		.setCustomId(this.customId('title'))
		.setLabel('Title')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('Write the title to be used for the category.');
	const descriptionInput = (
		options?.description ? new TextInputBuilder().setValue(options.description) : new TextInputBuilder()
	)
		.setCustomId(this.customId('description'))
		.setLabel('Description')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('Write the description to be used for the category.');

	const row1 = new ActionRowBuilder<TextInputBuilder>().setComponents(emojiInput);
	const row2 = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
	const row3 = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionInput);

	const modal = new ModalBuilder()
		.setCustomId(this.customId(`ticket_threads_category_fields${options?.id ? '_dynamic' : ''}`, options?.id))
		.setTitle('Category Emoji, Title, & Description')
		.setComponents(row1, row2, row3);

	return context.interaction.showModal(modal).catch(() => false);
}
