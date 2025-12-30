import { container, customId } from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	type Client,
	HeadingLevel,
	heading,
	type InteractionReplyOptions,
	type Locale,
	MessageFlags,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
} from 'discord.js';
import { translate } from '@/i18n';

export function configurationMenu({ client, locale }: { client: Client<true>; locale: Locale }) {
	const translations = translate(locale).commands['bot-profile'].command.container;

	return {
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
				client,
			}),
		],
		flags: [MessageFlags.IsComponentsV2],
	} satisfies InteractionReplyOptions;
}
