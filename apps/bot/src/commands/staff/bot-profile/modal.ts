import { container, customId, DeferUpdate, Modal, userEmbedError } from '@ticketer/djs-framework';
import {
	ContainerBuilder,
	codeBlock,
	HeadingLevel,
	heading,
	inlineCode,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	PermissionFlagsBits,
	TextDisplayBuilder,
} from 'discord.js';
import { prettifyError, z } from 'zod';
import { translate } from '@/i18n';
import { configurationMenu } from './helpers';

export default class extends Modal.Interaction {
	public readonly customIds = [customId('bot_profile_menu_name')];

	public async execute({ interaction }: Modal.Context) {
		const translations = translate(interaction.locale).commands['bot-profile'].command.modals.name.response.errors;
		const {
			data: nick,
			error,
			success,
		} = z.string().min(0).max(32).safeParse(interaction.fields.getTextInputValue('name'));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
						title: translations.validation.title(),
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		if (!interaction.appPermissions.has(PermissionFlagsBits.ChangeNickname)) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: translations.permissions.description(),
						member: interaction.member,
						title: translations.permissions.title(),
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();
		let me = await interaction.guild.members.fetchMe();
		const oldName = me.displayName;

		me = await interaction.guild.members.editMe({ nick });
		const guildTranslations = translate(interaction.guildLocale).commands['bot-profile'].command.modals.name.response
			.success;

		interaction.editReply({
			components: [
				container({
					builder: (cont) =>
						cont
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(heading(guildTranslations.heading(), HeadingLevel.One)),
							)
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									guildTranslations.content({
										member: interaction.member.toString(),
										oldName: inlineCode(oldName),
										newName: inlineCode(me.displayName),
									}),
								),
							),
					client: interaction.client,
				}),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
		return interaction.followUp(configurationMenu({ client: interaction.client, locale: interaction.guildLocale }));
	}
}

export class Bio extends Modal.Interaction {
	public readonly customIds = [customId('bot_profile_menu_bio')];

	public async execute({ interaction }: Modal.Context) {
		const translations = translate(interaction.locale).commands['bot-profile'].command.modals.bio.response.errors;
		const {
			data: bio,
			error,
			success,
		} = z.string().min(0).max(190).safeParse(interaction.fields.getTextInputValue('bio'));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
						title: translations.validation.title(),
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();
		await interaction.guild.members.editMe({ bio });

		const guildTranslations = translate(interaction.guildLocale).commands['bot-profile'].command.modals.bio.response
			.success;
		const reply = new ContainerBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(heading(guildTranslations.heading(), HeadingLevel.One)),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					bio
						? guildTranslations.content.withBio({ member: interaction.member.toString() })
						: guildTranslations.content.withoutBio({ member: interaction.member.toString() }),
				),
			);

		if (bio) {
			reply.addTextDisplayComponents(new TextDisplayBuilder().setContent(codeBlock(bio)));
		}

		interaction.editReply({
			components: [container({ builder: reply, client: interaction.client })],
			flags: [MessageFlags.IsComponentsV2],
		});
		return interaction.followUp(configurationMenu({ client: interaction.client, locale: interaction.guildLocale }));
	}
}

export class Avatar extends Modal.Interaction {
	public readonly customIds = [customId('bot_profile_menu_avatar')];

	@DeferUpdate
	public async execute({ interaction }: Modal.Context) {
		const avatar = interaction.fields.getUploadedFiles('avatar', false)?.at(0)?.url ?? '';
		let me = await interaction.guild.members.fetchMe();
		const oldAvatar = me.displayAvatarURL();

		try {
			me = await interaction.guild.members.editMe({ avatar });
		} catch {
			const translatons = translate(interaction.locale).commands['bot-profile'].command.modals.avatar.response.errors
				.unknown;

			interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: translatons.description(),
						member: interaction.member,
						title: translatons.title(),
					}),
				],
			});
			return interaction.followUp(configurationMenu({ client: interaction.client, locale: interaction.guildLocale }));
		}

		const translatons = translate(interaction.guildLocale).commands['bot-profile'].command.modals.avatar.response
			.success;

		interaction.editReply({
			components: [
				container({
					builder: (cont) =>
						cont
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(heading(translatons.heading(), HeadingLevel.One)),
							)
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(translatons.content({ member: interaction.member.toString() })),
							)
							.addMediaGalleryComponents(
								new MediaGalleryBuilder().addItems(
									new MediaGalleryItemBuilder().setURL(oldAvatar),
									new MediaGalleryItemBuilder().setURL(me.displayAvatarURL()),
								),
							),
					client: interaction.client,
				}),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
		return interaction.followUp(configurationMenu({ client: interaction.client, locale: interaction.guildLocale }));
	}
}

export class Banner extends Modal.Interaction {
	public readonly customIds = [customId('bot_profile_menu_banner')];

	@DeferUpdate
	public async execute({ interaction }: Modal.Context) {
		const banner = interaction.fields.getUploadedFiles('banner', false)?.at(0)?.url ?? '';
		// Force fetch due to caching issues.
		let me = await interaction.guild.members.fetchMe({ force: true });
		const oldBanner = me.displayBannerURL();

		try {
			me = await interaction.guild.members.editMe({ banner });
		} catch {
			const translations = translate(interaction.locale).commands['bot-profile'].command.modals.banner.response.errors
				.unknown;

			interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: translations.description(),
						member: interaction.member,
						title: translations.title(),
					}),
				],
			});
			return interaction.followUp(configurationMenu({ client: interaction.client, locale: interaction.guildLocale }));
		}

		const translations = translate(interaction.locale).commands['bot-profile'].command.modals.banner.response.success;
		const member = interaction.member.toString();
		const newBanner = me.displayBannerURL();
		const reply = new ContainerBuilder()
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading(translations.heading(), HeadingLevel.One)))
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					oldBanner && newBanner
						? translations.content.oldAndNew({ member })
						: oldBanner && !newBanner
							? translations.content.oldAndNoNew({ member })
							: !oldBanner && newBanner
								? translations.content.noOldAndNew({ member })
								: translations.content.noOldAndNoNew({ member }),
				),
			);

		if (oldBanner || newBanner) {
			const builder = new MediaGalleryBuilder();

			if (oldBanner) {
				builder.addItems(new MediaGalleryItemBuilder().setURL(oldBanner));
			}

			if (newBanner) {
				builder.addItems(new MediaGalleryItemBuilder().setURL(newBanner));
			}

			reply.addMediaGalleryComponents(builder);
		}

		interaction.editReply({
			components: [container({ builder: reply, client: interaction.client })],
			flags: [MessageFlags.IsComponentsV2],
		});
		return interaction.followUp(configurationMenu({ client: interaction.client, locale: interaction.guildLocale }));
	}
}
