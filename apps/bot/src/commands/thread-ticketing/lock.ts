import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { Locale } from 'discord.js';
import { ThreadTicketing } from '@/utils';

const dataTranslations = translate(Locale.EnglishGB).commands.lock.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.lock.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.lock.data.description'));

	@DeferReply(true)
	public execute(context: Command.Context) {
		void ThreadTicketing.lockTicket.call(this, context);
	}
}
