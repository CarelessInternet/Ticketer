import { ApplicationCommandType, MessageFlags, hyperlink, inlineCode } from 'discord.js';
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
			if (command.ownerOnly) continue;
			if (command.guildOnly && interaction.guildId !== environment.DISCORD_GUILD_ID) continue;

			const name = command.data.name_localizations?.[interaction.locale] ?? command.data.name;
			commandsArray.push(inlineCode(command.commandType === ApplicationCommandType.ChatInput ? `/${name}` : name));
		}

		const commands = commandsArray.join(', ');
		const translations = translate(interaction.locale).commands.help.command.embeds[0];

		const commandDocumentation = hyperlink(
			translations.fields[1].links.commandDocumentation(),
			new URL('/en-GB/docs/commands', environment.WEBSITE_URL).toString(),
		);
		const donate = hyperlink(
			translations.fields[1].links.donate(),
			new URL('/links/funding/donate', environment.WEBSITE_URL).toString(),
		);
		const website = hyperlink(translations.fields[1].links.website(), environment.WEBSITE_URL);
		const supportServer = environment.DISCORD_SUPPORT_SERVER
			? hyperlink(translations.fields[1].links.supportServer(), environment.DISCORD_SUPPORT_SERVER)
			: undefined;
		const inviteLink = hyperlink(
			translations.fields[1].links.invite(),
			new URL('/links/discord/invite', environment.WEBSITE_URL).toString(),
		);

		const linksAsString = [commandDocumentation, donate, website, supportServer, inviteLink]
			.filter(Boolean)
			.join(' | ');

		const embed = super
			.userEmbed(interaction.member)
			.setTitle(translations.title())
			.setDescription(translations.description({ commands }))
			.setFields(
				{
					name: translations.fields[0].name(),
					value: translations.fields[0].value(),
				},
				{
					name: translations.fields[1].name(),
					value: linksAsString,
				},
			);

		void interaction.reply({ embeds: [embed], flags: ephemeral ? [MessageFlags.Ephemeral] : undefined });
	}
}
