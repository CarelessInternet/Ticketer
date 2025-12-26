import { type Command, type Component, customId } from '@ticketer/djs-framework';
import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { translate } from '@/i18n';

export function renameTitleModal({ interaction }: Command.Context | Component.Context, isAutomaticThreads = false) {
	const translations = translate(interaction.locale).tickets[isAutomaticThreads ? 'automaticThreads' : 'userForums']
		.actions.renameTitle.component.modal;

	const input = new LabelBuilder()
		.setLabel(translations.inputs[0].label())
		.setDescription(translations.inputs[0].description())
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId(customId('title'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(100)
				.setStyle(TextInputStyle.Short),
		);

	const modal = new ModalBuilder()
		.setCustomId(
			customId(`ticket_${isAutomaticThreads ? 'automatic_threads' : 'user_forums'}_thread_rename_title_modal`),
		)
		.setTitle(translations.title())
		.setLabelComponents(input);

	return interaction.showModal(modal).catch(() => false);
}
