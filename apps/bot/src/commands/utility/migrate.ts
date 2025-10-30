import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { PermissionFlagsBits } from 'discord.js';
import { migrate } from '@ticketer/database';

const dataTranslations = translate().commands.migrate.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.migrate.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.migrate.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	public readonly guildOnly = true;
	public readonly ownerOnly = true;

	@DeferReply({ ephemeral: true })
	public async execute({ interaction }: Command.Context) {
		await migrate();

		const translations = translate(interaction.locale).commands.migrate.command.embeds[0];
		void interaction.editReply({
			embeds: [
				super.userEmbed(interaction.member).setTitle(translations.title()).setDescription(translations.description()),
			],
		});
	}
}
