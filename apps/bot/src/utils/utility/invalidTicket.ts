import type { BaseInteraction, Command } from '@ticketer/djs-framework';
import { translate } from '@/i18n';

export function invalidTicket(this: BaseInteraction.Interaction, { interaction }: Command.Context) {
	const translations = translate(interaction.locale).tickets.errors.invalidTicket;
	const parameters = {
		embeds: [this.userEmbedError(interaction.user, translations.title()).setDescription(translations.description())],
	};

	return interaction.deferred ? interaction.editReply(parameters) : interaction.reply(parameters);
}
