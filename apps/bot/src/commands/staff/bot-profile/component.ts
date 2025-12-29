import { Component, customId, userEmbedError } from '@ticketer/djs-framework';
import {
	FileUploadBuilder,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { translate } from '@/i18n';

export default class extends Component.Interaction {
	public readonly customIds = [customId('bot_profile_menu')];

	public execute({ interaction }: Component.Context<'string'>) {
		const guildTranslations = translate(interaction.locale).commands['bot-profile'].command.modals;

		switch (interaction.values.at(0)) {
			case 'name': {
				return interaction.showModal(
					new ModalBuilder()
						.setCustomId(customId('bot_profile_menu_name'))
						.setTitle(guildTranslations.name.input.title())
						.setLabelComponents(
							new LabelBuilder()
								.setLabel(guildTranslations.name.input.labels[0].label())
								.setDescription(guildTranslations.name.input.labels[0].description())
								.setTextInputComponent(
									new TextInputBuilder()
										.setCustomId(customId('name'))
										.setRequired(false)
										.setMinLength(1)
										.setMaxLength(32)
										.setStyle(TextInputStyle.Short)
										.setPlaceholder(guildTranslations.name.input.labels[0].text.placeholder()),
								),
						),
				);
			}
			case 'bio': {
				return interaction.showModal(
					new ModalBuilder()
						.setCustomId(customId('bot_profile_menu_bio'))
						.setTitle(guildTranslations.bio.input.title())
						.setLabelComponents(
							new LabelBuilder()
								.setLabel(guildTranslations.bio.input.labels[0].label())
								.setDescription(guildTranslations.bio.input.labels[0].description())
								.setTextInputComponent(
									new TextInputBuilder()
										.setCustomId(customId('bio'))
										.setRequired(false)
										.setMinLength(1)
										.setMaxLength(190)
										.setStyle(TextInputStyle.Paragraph),
								),
						),
				);
			}
			case 'avatar': {
				return interaction.showModal(
					new ModalBuilder()
						.setCustomId(customId('bot_profile_menu_avatar'))
						.setTitle(guildTranslations.avatar.input.title())
						.setLabelComponents(
							new LabelBuilder()
								.setLabel(guildTranslations.avatar.input.labels[0].label())
								.setDescription(guildTranslations.avatar.input.labels[0].description())
								.setFileUploadComponent(
									new FileUploadBuilder()
										.setCustomId(customId('avatar'))
										.setRequired(false)
										.setMinValues(1)
										.setMaxValues(1),
								),
						),
				);
			}
			case 'banner': {
				return interaction.showModal(
					new ModalBuilder()
						.setCustomId(customId('bot_profile_menu_banner'))
						.setTitle(guildTranslations.banner.input.title())
						.setLabelComponents(
							new LabelBuilder()
								.setLabel(guildTranslations.banner.input.labels[0].label())
								.setDescription(guildTranslations.banner.input.labels[0].description())
								.setFileUploadComponent(
									new FileUploadBuilder()
										.setCustomId(customId('banner'))
										.setRequired(false)
										.setMinValues(1)
										.setMaxValues(1),
								),
						),
				);
			}
			default: {
				const translations = translate(interaction.locale).commands['bot-profile'].command.modals.errors.select;

				return interaction.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: translations.description(),
							member: interaction.member,
							title: translations.title(),
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}
}
