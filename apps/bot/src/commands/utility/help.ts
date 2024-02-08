import { OAuth2Scopes, PermissionFlagsBits, hyperlink, inlineCode } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { Command } from '@ticketer/djs-framework';
import { environment } from '@ticketer/env/bot';

const dataTranslations = translate().commands.help.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.help.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.help.data.description'))
		.addBooleanOption((option) =>
			option
				.setName(dataTranslations.options[0].name())
				.setNameLocalizations(getTranslations('commands.help.data.options.0.name'))
				.setDescription(dataTranslations.options[0].description())
				.setDescriptionLocalizations(getTranslations('commands.help.data.options.0.description'))
				.setRequired(false),
		);

	public execute({ interaction }: Command.Context<'chat'>) {
		const ephemeral = interaction.options.getBoolean(dataTranslations.options[0].name()) ?? true;
		const commandsArray: string[] = [];

		for (const command of this.client.commands.values()) {
			const name = command.data.name_localizations?.[interaction.locale] ?? command.data.name;
			commandsArray.push(inlineCode(`/${name}`));
		}

		const commands = commandsArray.join(', ');
		const translations = translate(interaction.locale).commands.help.command.embeds[0];

		const supportServer = environment.DISCORD_SUPPORT_SERVER
			? hyperlink(translations.fields[0].links.supportServer(), environment.DISCORD_SUPPORT_SERVER)
			: undefined;
		const inviteLink = hyperlink(
			translations.fields[0].links.invite(),
			this.client.generateInvite({
				scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
				permissions: [
					PermissionFlagsBits.CreatePrivateThreads,
					PermissionFlagsBits.CreatePublicThreads,
					PermissionFlagsBits.ManageChannels,
					PermissionFlagsBits.ManageMessages,
					PermissionFlagsBits.ManageThreads,
					PermissionFlagsBits.MentionEveryone,
					PermissionFlagsBits.ViewChannel,
					PermissionFlagsBits.SendMessages,
					PermissionFlagsBits.SendMessagesInThreads,
				],
			}),
		);

		const linksAsString = [supportServer, inviteLink].filter(Boolean).join(' | ');

		const embed = super
			.userEmbed(interaction.user)
			.setTitle(translations.title())
			.setDescription(translations.description({ commands }))
			.setFields({
				name: translations.fields[0].name(),
				value: linksAsString,
			});

		void interaction.reply({ embeds: [embed], ephemeral });
	}
}
