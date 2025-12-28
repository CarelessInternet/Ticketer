import { Command, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { inlineCode, MessageFlags, Status } from 'discord.js';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate().commands.ping;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.data.name())
		.setNameLocalizations(getTranslations('commands.ping.data.name'))
		.setDescription(dataTranslations.data.description())
		.setDescriptionLocalizations(getTranslations('commands.ping.data.description'));

	public async execute({ interaction }: Command.Context) {
		const translations = translate(interaction.locale).commands.ping.command;
		const reply = userEmbed(interaction.member).setTitle(translations.embeds[0].title());

		const callback = await interaction.reply({
			embeds: [reply],
			flags: [MessageFlags.Ephemeral],
			withResponse: true,
		});

		if (!callback.resource?.message) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: translations.embeds[1].description(),
						member: interaction.member,
						title: translations.embeds[1].title(),
					}),
				],
			});
		}

		reply.setTitle(translations.embeds[2].title());
		reply.setFields(
			{
				name: translations.embeds[2].fields[0].name(),
				value: translations.embeds[2].fields[0].value({ ms: interaction.client.ws.ping }),
				inline: true,
			},
			{
				name: translations.embeds[2].fields[1].name(),
				value: translations.embeds[2].fields[1].value({
					ms: callback.resource.message.createdTimestamp - callback.interaction.createdTimestamp,
				}),
				inline: true,
			},
			{
				name: translations.embeds[2].fields[2].name(),
				value: translations.embeds[2].fields[2].value({
					status: inlineCode(Status[interaction.client.ws.status]),
				}),
				inline: true,
			},
		);

		void interaction.editReply({ embeds: [reply] });
	}
}
