import { asc, database, eq, ticketThreadsCategories, ticketThreadsConfigurations } from '@ticketer/database';
import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import {
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
				const embed = this.userEmbedError(interaction.member).setDescription(
					'Please create a global thread ticket configuration before creating categories.',
				);

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

function categoryViewContainers(
	this: BaseInteraction.Interaction,
	context: Command.Context | Component.Context,
	categories: (typeof ticketThreadsCategories.$inferSelect)[],
) {
	return categories.map((category) =>
		this.container((cont) =>
			ticketThreadsOpeningMessageContainer({
				categoryEmoji: category.categoryEmoji,
				categoryTitle: category.categoryTitle,
				description: category.openingMessageDescription,
				container: cont
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							heading(`Channel: ${category.channelId ? channelMention(category.channelId) : 'None'}`, HeadingLevel.One),
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
					.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)))
					.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
				locale: context.interaction.guildLocale,
				member: context.interaction.member,
				title: category.openingMessageTitle,
			}),
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

	const containers = categoryViewContainers.call(this, context, categories);
	const pagination = messageWithPagination({
		previous: { customId: this.customId('ticket_threads_category_view_previous', page), disabled: page === 0 },
		next: {
			customId: this.customId('ticket_threads_category_view_next', page),
			disabled: categories.length < CATEGORY_PAGE_SIZE,
		},
	});

	return context.interaction.editReply({
		allowedMentions: { parse: [] },
		components: [...containers, ...pagination],
		flags: [MessageFlags.IsComponentsV2],
	});
}

export function categoryFieldsModal(
	this: BaseInteraction.Interaction,
	context: Command.Context | Component.Context,
	options?: { id?: string | number; emoji?: string | null; title?: string; description?: string },
) {
	const emojiInput = new LabelBuilder()
		.setLabel('Emoji')
		.setDescription('Write an emoji to be used for the category.')
		.setTextInputComponent(
			(options?.emoji ? new TextInputBuilder().setValue(options.emoji) : new TextInputBuilder())
				.setCustomId(this.customId('emoji'))
				.setRequired(false)
				.setMinLength(1)
				// 8 because of unicode.
				.setMaxLength(8)
				.setStyle(TextInputStyle.Short),
		);
	const titleInput = new LabelBuilder()
		.setLabel('Title')
		.setDescription('Write the title to be used for the category.')
		.setTextInputComponent(
			(options?.title ? new TextInputBuilder().setValue(options.title) : new TextInputBuilder())
				.setCustomId(this.customId('title'))
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
				.setCustomId(this.customId('description'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(100)
				.setStyle(TextInputStyle.Paragraph),
		);

	const modal = new ModalBuilder()
		.setCustomId(this.customId(`ticket_threads_category_fields${options?.id ? '_dynamic' : ''}`, options?.id))
		.setTitle('Category Emoji, Title, & Description')
		.setLabelComponents(emojiInput, titleInput, descriptionInput);

	return context.interaction.showModal(modal).catch(() => false);
}
