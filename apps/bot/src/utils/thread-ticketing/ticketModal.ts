import { LabelBuilder, type Locale, ModalBuilder, type Snowflake, TextInputBuilder, TextInputStyle } from 'discord.js';
import type { BaseInteraction } from '@ticketer/djs-framework';
import type { ticketThreadsCategories } from '@ticketer/database';
import { translate } from '@/i18n';

interface TicketModalOptions {
	categoryId: typeof ticketThreadsCategories.$inferSelect.id | string;
	locale: Locale;
	proxiedUserId?: Snowflake;
	titleAndDescriptionRequired: typeof ticketThreadsCategories.$inferSelect.titleAndDescriptionRequired;
}

export function ticketModal(
	this: BaseInteraction.Interaction,
	{ categoryId, locale, proxiedUserId, titleAndDescriptionRequired }: TicketModalOptions,
) {
	const translations = translate(locale).tickets.threads.categories.createModal;

	const titleInput = new LabelBuilder()
		.setLabel(translations.title.label())
		.setDescription(translations.title.description())
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId(this.customId('title'))
				.setRequired(titleAndDescriptionRequired)
				.setMinLength(1)
				.setMaxLength(100)
				.setStyle(TextInputStyle.Short),
		);
	const descriptonInput = new LabelBuilder()
		.setLabel(translations.description.label())
		.setDescription(translations.description.description())
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId(this.customId('description'))
				.setRequired(titleAndDescriptionRequired)
				.setMinLength(1)
				.setMaxLength(2000)
				.setStyle(TextInputStyle.Paragraph),
		);

	return new ModalBuilder()
		.setCustomId(
			this.customId(
				'ticket_threads_categories_create_ticket',
				proxiedUserId ? `${categoryId.toString()}_${proxiedUserId}` : categoryId,
			),
		)
		.setTitle(translations.modalTitle())
		.setLabelComponents(titleInput, descriptonInput);
}
