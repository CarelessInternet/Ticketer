import { Command } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate().commands['guild-blacklist'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.guild-blacklist.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.guild-blacklist.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(dataTranslations.subcommands[0].name())
				.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.0.name'))
				.setDescription(dataTranslations.subcommands[0].description())
				.setDescriptionLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.0.description')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(dataTranslations.subcommands[1].name())
				.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.1.name'))
				.setDescription(dataTranslations.subcommands[1].description())
				.setDescriptionLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.1.description'))
				.addStringOption((option) =>
					option
						.setName(dataTranslations.subcommands[1].options[0].name())
						.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.1.options.0.name'))
						.setDescription(dataTranslations.subcommands[1].options[0].description())
						.setDescriptionLocalizations(
							getTranslations('commands.guild-blacklist.data.subcommands.1.options.0.description'),
						)
						.setRequired(true)
						.setMinLength(17),
				)
				.addStringOption((option) =>
					option
						.setName(dataTranslations.subcommands[1].options[1].name())
						.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.1.options.1.name'))
						.setDescription(dataTranslations.subcommands[1].options[1].description())
						.setDescriptionLocalizations(
							getTranslations('commands.guild-blacklist.data.subcommands.1.options.1.description'),
						)
						.setRequired(true)
						.setMinLength(1)
						.setMaxLength(500),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(dataTranslations.subcommands[2].name())
				.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.2.name'))
				.setDescription(dataTranslations.subcommands[2].description())
				.setDescriptionLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.2.description'))
				.addStringOption((option) =>
					option
						.setName(dataTranslations.subcommands[2].options[0].name())
						.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.2.options.0.name'))
						.setDescription(dataTranslations.subcommands[2].options[0].description())
						.setDescriptionLocalizations(
							getTranslations('commands.guild-blacklist.data.subcommands.2.options.0.description'),
						)
						.setRequired(true)
						.setMinLength(17),
				),
		);
	public readonly ownerOnly = true;
	public readonly guildOnly = true;

	public execute: undefined;
}
