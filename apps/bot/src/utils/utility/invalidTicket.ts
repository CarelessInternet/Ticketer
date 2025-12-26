import { type Command, userEmbedError } from '@ticketer/djs-framework';
import { translate } from '@/i18n';

export function invalidTicket({ interaction }: Command.Context) {
	const translations = translate(interaction.locale).tickets.errors.invalidTicket;
	const parameters = {
		embeds: [
			userEmbedError({
				...interaction,
				description: translations.description(),
				title: translations.title(),
			}),
		],
	};

	return interaction.deferred ? interaction.editReply(parameters) : interaction.reply(parameters);
}
