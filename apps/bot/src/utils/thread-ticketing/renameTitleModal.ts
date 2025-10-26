import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { translate } from '@/i18n';

export function renameTitleModal(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context | Component.Context,
) {
	const translations = translate(interaction.locale).tickets.threads.categories.actions.renameTitle.component.modal;

	const input = new LabelBuilder()
		.setLabel(translations.inputs[0].label())
		.setDescription(translations.inputs[0].description())
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId(this.customId('title'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(100)
				.setStyle(TextInputStyle.Short),
		);

	const modal = new ModalBuilder()
		.setCustomId(this.customId('ticket_threads_categories_create_rename_title_modal'))
		.setTitle(translations.title())
		.setLabelComponents(input);

	return interaction.showModal(modal).catch(() => false);
}
