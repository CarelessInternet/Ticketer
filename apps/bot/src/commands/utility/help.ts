import { Command, DeferReply } from '@ticketer/djs-framework';
import { environment } from '@ticketer/env/bot';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle,
	chatInputApplicationCommandMention,
	heading,
	inlineCode,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
} from 'discord.js';
import { getLocale, getTranslations, translate } from '@/i18n';

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

	@DeferReply({ name: dataTranslations.options[0].name(), ephemeral: true })
	public async execute({ interaction }: Command.Context<'chat'>) {
		const fetchedCommands = await interaction.client.application.commands.fetch({
			withLocalizations: true,
		});

		const commandsArray: string[] = [];

		for (const command of this.client.commands.values()) {
			if (command.ownerOnly) continue;
			if (command.guildOnly && interaction.guildId !== environment.DISCORD_GUILD_ID) continue;

			const { name: rawName } = command.data;
			const fetchedCommand = fetchedCommands.find((command) => command.name === rawName);

			if (!fetchedCommand) continue;

			const { id, name, nameLocalizations } = fetchedCommand;
			const hasSubcommands = fetchedCommand.options.some((cmd) =>
				[ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(cmd.type),
			);

			commandsArray.push(
				fetchedCommand.type === ApplicationCommandType.ChatInput
					? hasSubcommands
						? inlineCode(`/${nameLocalizations?.[interaction.locale] ?? name}`)
						: chatInputApplicationCommandMention(name, id)
					: inlineCode(nameLocalizations?.[interaction.locale] ?? name),
			);
		}

		const translations = translate(interaction.locale).commands.help.command.components;

		const commands = commandsArray.join(', ');
		const buttons: { label: string; url: string }[] = [
			{
				label: translations[2].links.donate(),
				url: this.UTM('/links/funding/donate'),
			},
			{
				label: translations[2].links.website(),
				url: this.UTM(),
			},
			...(environment.DISCORD_SUPPORT_SERVER
				? [
						{
							label: translations[2].links.supportServer(),
							url: new URL(environment.DISCORD_SUPPORT_SERVER).toString(),
						},
					]
				: []),
			{
				label: translations[2].links.invite(),
				url: this.UTM('/links/discord/invite'),
			},
		];

		const container = super.container((cont) =>
			cont
				.addSectionComponents(
					new SectionBuilder()
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(heading(translations[0].text[0].content())),
							new TextDisplayBuilder().setContent(commands),
						)
						.setButtonAccessory(
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(translations[0].button.label())
								.setURL(this.UTM(`/${getLocale(interaction.locale)}/docs/commands`)),
						),
				)
				.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading(translations[1].text())))
				.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false))
				.addActionRowComponents(
					new ActionRowBuilder<ButtonBuilder>().setComponents(
						buttons.map((button) =>
							new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(button.label).setURL(button.url),
						),
					),
				),
		);

		void interaction.editReply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
	}

	private UTM(route = '') {
		const url = new URL(route, environment.WEBSITE_URL);
		url.searchParams.set('utm_source', 'ticketer-bot');
		url.searchParams.set('utm_medium', 'button link');
		url.searchParams.set('utm_content', 'command help');

		return url.toString();
	}
}
