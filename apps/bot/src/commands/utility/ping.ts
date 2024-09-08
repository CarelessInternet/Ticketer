import { Status, inlineCode } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { Command } from '@ticketer/djs-framework';

const dataTranslations = translate().commands.ping;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.data.name())
		.setNameLocalizations(getTranslations('commands.ping.data.name'))
		.setDescription(dataTranslations.data.description())
		.setDescriptionLocalizations(getTranslations('commands.ping.data.description'));

	public async execute({ interaction }: Command.Context) {
		const translations = translate(interaction.locale).commands.ping.command;
		const embed = super.userEmbed(interaction.member).setTitle(translations.embeds[0].title());

		const message = await interaction.reply({
			embeds: [embed],
			ephemeral: true,
			fetchReply: true,
		});

		embed.setTitle(translations.embeds[1].title());
		embed.setFields(
			{
				name: translations.embeds[1].fields[0].name(),
				value: translations.embeds[1].fields[0].value({ ms: interaction.client.ws.ping }),
				inline: true,
			},
			{
				name: translations.embeds[1].fields[1].name(),
				value: translations.embeds[1].fields[1].value({
					ms: message.createdTimestamp - interaction.createdTimestamp,
				}),
				inline: true,
			},
			{
				name: translations.embeds[1].fields[2].name(),
				value: translations.embeds[1].fields[2].value({
					status: inlineCode(Status[interaction.client.ws.status]),
				}),
				inline: true,
			},
		);

		void interaction.editReply({ embeds: [embed] });
	}
}
