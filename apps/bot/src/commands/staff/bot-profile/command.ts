import { Command } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { configurationMenu } from './helpers';

const dataTranslations = translate().commands['bot-profile'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.bot-profile.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.bot-profile.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname | PermissionFlagsBits.ManageGuild);

	public execute({ interaction }: Command.Context<'chat'>) {
		void interaction.reply(configurationMenu({ client: interaction.client, locale: interaction.guildLocale }));
	}
}
