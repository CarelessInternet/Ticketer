import { Command, container, customId } from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	HeadingLevel,
	heading,
	MessageFlags,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
} from 'discord.js';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate().commands['bot-profile'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.bot-profile.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.bot-profile.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname | PermissionFlagsBits.ManageGuild);

	public execute({ interaction }: Command.Context<'chat'>) {
		const translations = translate(interaction.guildLocale).commands['bot-profile'].command.container;

		void interaction.reply({
			components: [
				container({
					builder: (cont) =>
						cont
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(heading(translations.heading(), HeadingLevel.Three)),
							)
							.addActionRowComponents(
								new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
									new StringSelectMenuBuilder()
										.setCustomId(customId('bot_profile_menu'))
										.setMinValues(1)
										.setMaxValues(1)
										.setPlaceholder(translations.menu.placeholder())
										.setOptions(
											new StringSelectMenuOptionBuilder()
												.setEmoji('🪪')
												.setLabel(translations.menu.name.label())
												.setDescription(translations.menu.name.description())
												.setValue('name'),
											new StringSelectMenuOptionBuilder()
												.setEmoji('📔')
												.setLabel(translations.menu.bio.label())
												.setDescription(translations.menu.bio.description())
												.setValue('bio'),
											new StringSelectMenuOptionBuilder()
												.setEmoji('👤')
												.setLabel(translations.menu.avatar.label())
												.setDescription(translations.menu.avatar.description())
												.setValue('avatar'),
											new StringSelectMenuOptionBuilder()
												.setEmoji('🖼️')
												.setLabel(translations.menu.banner.label())
												.setDescription(translations.menu.banner.description())
												.setValue('banner'),
										),
								),
							),
					client: interaction.client,
				}),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
	}
}
