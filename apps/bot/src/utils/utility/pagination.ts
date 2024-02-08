import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from 'discord.js';
import { type MySqlSelect } from '@ticketer/database';

interface PaginationOptions {
	page: number;
	pageSize: number;
}

interface WithPaginationOptions<T extends MySqlSelect> extends PaginationOptions {
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
	previous: ButtonInfo;
	next: ButtonInfo;
}

export function messageWithPagination({
	previous,
	next,
}: EmbedWithPaginationOptions): InteractionReplyOptions['components'] {
	const previousPageButton = new ButtonBuilder()
		.setCustomId(previous.customId)
		.setEmoji('⏮')
		.setLabel(previous.label ?? 'Previous Page')
		.setStyle(ButtonStyle.Primary)
		.setDisabled(previous.disabled);
	const nextPageButton = new ButtonBuilder()
		.setCustomId(next.customId)
		.setEmoji('⏭')
		.setLabel(next.label ?? 'Next Page')
		.setStyle(ButtonStyle.Success)
		.setDisabled(next.disabled);

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents(previousPageButton, nextPageButton);

	return [row];
}
