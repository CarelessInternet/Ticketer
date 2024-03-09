import {
	ActionRowBuilder,
	type Locale,
	ModalBuilder,
	type Snowflake,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import type { BaseInteraction } from '@ticketer/djs-framework';
import type { ticketThreadsCategories } from '@ticketer/database';
import { translate } from '@/i18n';

interface TicketModalOptions {
	categoryId: typeof ticketThreadsCategories.$inferSelect.id | string;
	locale: Locale;
	userId?: Snowflake;
}

export function ticketModal(this: BaseInteraction.Interaction, { categoryId, locale, userId }: TicketModalOptions) {
	const translations = translate(locale).tickets.threads.categories.createModal;
	const titleInput = new TextInputBuilder()
		.setCustomId(this.customId('title'))
		.setLabel(translations.title.label())
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(translations.title.placeholder());
	const descriptonInput = new TextInputBuilder()
		.setCustomId(this.customId('description'))
		.setLabel(translations.description.label())
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(2000)
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder(translations.description.placeholder());

	const titleRow = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
	const descriptionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptonInput);

	return new ModalBuilder()
		.setCustomId(
			this.customId('ticket_threads_categories_create_ticket', userId ? `${categoryId}_${userId}` : categoryId),
		)
		.setTitle(translations.modalTitle())
		.setComponents(titleRow, descriptionRow);
}
