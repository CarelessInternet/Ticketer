import { Command, DeferReply, RequiredChannelPermissions } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { PermissionFlagsBits } from 'discord.js';

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
	@RequiredChannelPermissions(PermissionFlagsBits.ManageMessages)
	public async execute({ interaction }: Command.Context<'chat'>) {
		if (interaction.channel) {
			const translations = translate(interaction.locale).commands.purge.command.embeds[0];

			const amount = interaction.options.getInteger(dataTranslations.options[0].name(), true);
			const deleted = await interaction.channel.bulkDelete(amount);

			const embed = super
				.userEmbed(interaction.user)
				.setTitle(translations.title())
				.setDescription(translations.description({ amount: deleted.size }));

			return interaction.editReply({ embeds: [embed] });
		}
	}
}
