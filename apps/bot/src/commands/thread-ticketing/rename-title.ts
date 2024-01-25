import { getTranslations, translate } from '@/i18n';
import { Command } from '@ticketer/djs-framework';
import { Locale } from 'discord.js';
import { ThreadTicketing } from '@/utils';

const dataTranslations = translate(Locale.EnglishGB).commands['rename-title'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.rename-title.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.rename-title.data.description'));

	public execute(context: Command.Context) {
		void ThreadTicketing.renameTitleModal.call(this, context);
	}
}
