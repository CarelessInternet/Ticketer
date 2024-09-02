import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { translate } from '@/i18n';

export function renameTitleModal(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context | Component.Context,
	isAutomaticThreads = false,
) {
	const translations = translate(interaction.locale).tickets[isAutomaticThreads ? 'automaticThreads' : 'userForums']
		.actions.renameTitle.component.modal;

	const input = new TextInputBuilder()
		.setCustomId(this.customId('title'))
		.setLabel(translations.inputs[0].label())
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(translations.inputs[0].placeholder());

	const row = new ActionRowBuilder<TextInputBuilder>().setComponents(input);
	const modal = new ModalBuilder()
		.setCustomId(
			this.customId(`ticket_${isAutomaticThreads ? 'automatic_threads' : 'user_forums'}_thread_rename_title_modal`),
		)
		.setTitle(translations.title())
		.setComponents(row);

	return interaction.showModal(modal).catch(() => false);
}
