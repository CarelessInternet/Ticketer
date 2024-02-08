import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from 'discord.js';

interface ButtonOptions {
	customId: string;
	label: string;
}

interface TicketButtons {
	renameTitle: ButtonOptions;
	lock: ButtonOptions;
	close: ButtonOptions;
	lockAndClose: ButtonOptions;
	delete: ButtonOptions;
}

export function ticketButtons({
	close,
	lock,
	lockAndClose,
	renameTitle,
	...rest
}: TicketButtons): InteractionReplyOptions['components'] {
	const renameTitleButton = new ButtonBuilder()
		.setCustomId(renameTitle.customId)
		.setEmoji('📝')
		.setLabel(renameTitle.label)
		.setStyle(ButtonStyle.Secondary);
	const lockButton = new ButtonBuilder()
		.setCustomId(lock.customId)
		.setEmoji('🔒')
		.setLabel(lock.label)
		.setStyle(ButtonStyle.Primary);
	const closeButton = new ButtonBuilder()
		.setCustomId(close.customId)
		.setEmoji('🗃')
		.setLabel(close.label)
		.setStyle(ButtonStyle.Success);
	const lockAndCloseButton = new ButtonBuilder()
		.setCustomId(lockAndClose.customId)
		.setEmoji('🔐')
		.setLabel(lockAndClose.label)
		.setStyle(ButtonStyle.Primary);
	const deleteButton = new ButtonBuilder()
		.setCustomId(rest.delete.customId)
		.setEmoji('🗑')
		.setLabel(rest.delete.label)
		.setStyle(ButtonStyle.Danger);

	const buttonRow1 = new ActionRowBuilder<ButtonBuilder>().setComponents(renameTitleButton, lockButton, closeButton);
	const buttonRow2 = new ActionRowBuilder<ButtonBuilder>().setComponents(lockAndCloseButton, deleteButton);

	return [buttonRow1, buttonRow2];
}
