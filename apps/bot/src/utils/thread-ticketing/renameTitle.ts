import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { translate } from '@/i18n';

export function renameTitle(this: BaseInteraction.Interaction, { interaction }: Command.Context | Component.Context) {
	const translations = translate(interaction.locale).tickets.threads.categories.buttons.renameTitle.component;

	const input = new TextInputBuilder()
		.setCustomId(this.customId('title'))
		.setLabel('Thread Title')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('Write the new title that should be used for the thread.');

	const row = new ActionRowBuilder<TextInputBuilder>().setComponents(input);
	const modal = new ModalBuilder()
		.setCustomId(this.customId('ticket_threads_categories_create_rename_title_modal'))
		.setTitle(translations.modalTitle())
		.setComponents(row);

	return interaction.showModal(modal);
}
