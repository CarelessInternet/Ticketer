import { ButtonBuilder, ButtonStyle } from 'discord.js';

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

export function ticketButtons({ close, delete: Delete, lock, lockAndClose, renameTitle }: TicketButtons) {
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
		.setCustomId(Delete.customId)
		.setEmoji('🗑')
		.setLabel(Delete.label)
		.setStyle(ButtonStyle.Danger);

	// This specific order is relevant when spreading.
	return {
		renameTitle: renameTitleButton,
		lock: lockButton,
		close: closeButton,
		lockAndClose: lockAndCloseButton,
		delete: deleteButton,
	} as Record<keyof TicketButtons, ButtonBuilder>;
}
