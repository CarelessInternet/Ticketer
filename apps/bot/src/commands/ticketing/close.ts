import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { Locale } from 'discord.js';
import { closeTicket } from '@/utils';

const dataTranslations = translate(Locale.EnglishGB).commands.close.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.close.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.close.data.description'));

	@DeferReply(true)
	public execute(context: Command.Context) {
		void closeTicket.call(this, context);
	}
}
