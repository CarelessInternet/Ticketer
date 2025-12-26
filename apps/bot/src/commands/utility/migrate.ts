import { migrate } from '@ticketer/database';
import { Command, DeferReply, userEmbed } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { getTranslations, translate } from '@/i18n';

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
			embeds: [userEmbed(interaction).setTitle(translations.title()).setDescription(translations.description())],
		});
	}
}
