import { Command, DeferReply } from '@ticketer/djs-framework';
import { Locale, PermissionFlagsBits } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { migrate } from '@ticketer/database';

const dataTranslations = translate(Locale.EnglishGB).commands.migrate.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.migrate.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.migrate.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	public readonly guildOnly = true;
	public readonly ownerOnly = true;

	@DeferReply(true)
	public async execute({ interaction }: Command.Context) {
		await migrate();

		const translations = translate(interaction.locale).commands.migrate.command;
		void interaction.editReply({ content: translations.success() });
	}
}
