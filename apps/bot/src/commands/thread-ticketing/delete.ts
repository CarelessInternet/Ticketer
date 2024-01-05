import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { Locale } from 'discord.js';
import { deleteTicket } from '@/utils';

const dataTranslations = translate(Locale.EnglishGB).commands.delete.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.delete.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.delete.data.description'));

	@DeferReply(true)
	public execute(context: Command.Context) {
		void deleteTicket.call(this, context);
	}
}
