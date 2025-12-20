import { Component } from '@ticketer/djs-framework';
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
	public readonly customIds = [super.customId('bot_profile_menu')];

	public execute({ interaction }: Component.Context<'string'>) {
		const guildTranslations = translate(interaction.locale).commands['bot-profile'].command.modals;

		switch (interaction.values.at(0)) {
			case 'name': {
				return interaction.showModal(
					new ModalBuilder()
						.setCustomId(super.customId('bot_profile_menu', 'name'))
						.setTitle(guildTranslations.name.input.title())
						.setLabelComponents(
							new LabelBuilder()
								.setLabel(guildTranslations.name.input.labels[0].label())
								.setDescription(guildTranslations.name.input.labels[0].description())
								.setTextInputComponent(
									new TextInputBuilder()
										.setCustomId(super.customId('name'))
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
						.setCustomId(super.customId('bot_profile_menu', 'bio'))
						.setTitle(guildTranslations.bio.input.title())
						.setLabelComponents(
							new LabelBuilder()
								.setLabel(guildTranslations.bio.input.labels[0].label())
								.setDescription(guildTranslations.bio.input.labels[0].description())
								.setTextInputComponent(
									new TextInputBuilder()
										.setCustomId(super.customId('bio'))
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
						.setCustomId(super.customId('bot_profile_menu', 'avatar'))
						.setTitle(guildTranslations.avatar.input.title())
						.setLabelComponents(
							new LabelBuilder()
								.setLabel(guildTranslations.avatar.input.labels[0].label())
								.setDescription(guildTranslations.avatar.input.labels[0].description())
								.setFileUploadComponent(
									new FileUploadBuilder()
										.setCustomId(super.customId('avatar'))
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
						.setCustomId(super.customId('bot_profile_menu', 'banner'))
						.setTitle(guildTranslations.banner.input.title())
						.setLabelComponents(
							new LabelBuilder()
								.setLabel(guildTranslations.banner.input.labels[0].label())
								.setDescription(guildTranslations.banner.input.labels[0].description())
								.setFileUploadComponent(
									new FileUploadBuilder()
										.setCustomId(super.customId('banner'))
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
						super.userEmbedError(interaction.member, translations.title()).setDescription(translations.description()),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}
}
