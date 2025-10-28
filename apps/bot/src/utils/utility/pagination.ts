import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type InteractionReplyOptions, type Locale } from 'discord.js';
import { type MySqlSelect } from '@ticketer/database';
import { translate } from '@/i18n';

interface WithPaginationOptions<T extends MySqlSelect> {
	page: number;
	pageSize: number;
	query: T;
}

export function withPagination<T extends MySqlSelect>({ page, pageSize, query }: WithPaginationOptions<T>) {
	return query.limit(pageSize).offset(page * pageSize);
}

interface ButtonInfo {
	customId: string;
	disabled: boolean;
	label?: string;
}

interface EmbedWithPaginationOptions {
	locale?: Locale;
	next: ButtonInfo;
	previous: ButtonInfo;
}

export function messageWithPagination({ locale, next, previous }: EmbedWithPaginationOptions) {
	const translations = translate(locale).miscellaneous.paginationButtons;

	const previousPageButton = new ButtonBuilder()
		.setCustomId(previous.customId)
		.setEmoji('⏮')
		.setLabel(previous.label ?? translations.previous.label())
		.setStyle(ButtonStyle.Primary)
		.setDisabled(previous.disabled);
	const nextPageButton = new ButtonBuilder()
		.setCustomId(next.customId)
		.setEmoji('⏭')
		.setLabel(next.label ?? translations.next.label())
		.setStyle(ButtonStyle.Success)
		.setDisabled(next.disabled);

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents(previousPageButton, nextPageButton);

	return [row] satisfies InteractionReplyOptions['components'];
}
