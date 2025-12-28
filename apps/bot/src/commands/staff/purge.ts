import { Command, DeferReply, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { prettifyError, z } from 'zod';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate().commands.purge.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.purge.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.purge.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option
				.setName(dataTranslations.options[0].name())
				.setNameLocalizations(getTranslations('commands.purge.data.options.0.name'))
				.setDescription(dataTranslations.options[0].description())
				.setDescriptionLocalizations(getTranslations('commands.purge.data.options.0.description'))
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100),
		);

	@DeferReply({ ephemeral: true })
	public async execute({ interaction }: Command.Context<'chat'>) {
		if (interaction.channel) {
			const translations = translate(interaction.locale).commands.purge.command.embeds[0];
			const {
				data: amount,
				error,
				success,
			} = z.int().gte(2).lte(100).safeParse(interaction.options.getInteger(dataTranslations.options[0].name(), true));

			if (!success) {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: prettifyError(error),
							member: interaction.member,
							title: translations.title.error(),
						}),
					],
				});
			}

			const me = await interaction.guild.members.fetchMe();

			if (
				!interaction.channel
					.permissionsFor(me)
					.has([
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.ReadMessageHistory,
						PermissionFlagsBits.ManageMessages,
					])
			) {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: translations.description.error(),
							member: interaction.member,
							title: translations.title.error(),
						}),
					],
				});
			}

			const deleted = await interaction.channel.bulkDelete(amount);
			const embed = userEmbed(interaction)
				.setTitle(translations.title.success())
				.setDescription(translations.description.success({ amount: deleted.size }));

			return interaction.editReply({ embeds: [embed] });
		}
	}
}
