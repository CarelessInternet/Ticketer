import { DeferReply, Modal } from '@ticketer/djs-framework';
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
import z, { prettifyError } from 'zod';
import { translate } from '@/i18n';

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [super.dynamicCustomId('bot_profile_menu')];

	public async execute(context: Modal.Context) {
		const { dynamicValue } = super.extractCustomId(context.interaction.customId, true);

		switch (dynamicValue) {
			case 'name': {
				return this.name(context);
			}
			case 'bio': {
				return this.bio(context);
			}
			case 'avatar': {
				return this.avatar(context);
			}
			case 'banner': {
				return this.banner(context);
			}
			default: {
				const translations = translate(context.interaction.locale).commands['bot-profile'].command.modals.errors
					.customId;

				return context.interaction.reply({
					embeds: [
						super
							.userEmbedError(context.interaction.member, translations.title())
							.setDescription(translations.description()),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	private async name({ interaction }: Modal.Context) {
		const translations = translate(interaction.locale).commands['bot-profile'].command.modals.name.response.errors;
		const {
			data: nick,
			error,
			success,
		} = z.string().min(0).max(32).safeParse(interaction.fields.getTextInputValue('name'));

		if (!success) {
			return interaction.reply({
				embeds: [
					super
						.userEmbedError(interaction.member, translations.validation.title())
						.setDescription(prettifyError(error)),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		if (!interaction.appPermissions.has(PermissionFlagsBits.ChangeNickname)) {
			return interaction.reply({
				embeds: [
					super
						.userEmbedError(interaction.member, translations.permissions.title())
						.setDescription(translations.permissions.description()),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferReply();
		let me = await interaction.guild.members.fetchMe();
		const oldName = me.displayName;

		me = await interaction.guild.members.editMe({ nick });
		const guildTranslations = translate(interaction.guildLocale).commands['bot-profile'].command.modals.name.response
			.success;

		return interaction.editReply({
			components: [
				super.container((cont) =>
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
				),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
	}

	private async bio({ interaction }: Modal.Context) {
		const translations = translate(interaction.locale).commands['bot-profile'].command.modals.bio.response.errors;
		const {
			data: bio,
			error,
			success,
		} = z.string().min(0).max(190).safeParse(interaction.fields.getTextInputValue('bio'));

		if (!success) {
			return interaction.reply({
				embeds: [
					super
						.userEmbedError(interaction.member, translations.validation.title())
						.setDescription(prettifyError(error)),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferReply();
		await interaction.guild.members.editMe({ bio });

		const guildTranslations = translate(interaction.guildLocale).commands['bot-profile'].command.modals.bio.response
			.success;
		const container = new ContainerBuilder()
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
			container.addTextDisplayComponents(new TextDisplayBuilder().setContent(codeBlock(bio)));
		}

		return interaction.editReply({
			components: [super.container(container)],
			flags: [MessageFlags.IsComponentsV2],
		});
	}

	@DeferReply()
	private async avatar({ interaction }: Modal.Context) {
		const avatar = interaction.fields.getUploadedFiles('avatar', false)?.at(0)?.url ?? '';
		let me = await interaction.guild.members.fetchMe();
		const oldAvatar = me.displayAvatarURL();

		try {
			me = await interaction.guild.members.editMe({ avatar });
		} catch {
			const translatons = translate(interaction.locale).commands['bot-profile'].command.modals.avatar.response.errors
				.unknown;

			return interaction.editReply({
				embeds: [
					super.userEmbedError(interaction.member, translatons.title()).setDescription(translatons.description()),
				],
			});
		}

		const translatons = translate(interaction.guildLocale).commands['bot-profile'].command.modals.avatar.response
			.success;

		return interaction.editReply({
			components: [
				super.container((cont) =>
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
				),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
	}

	@DeferReply()
	private async banner({ interaction }: Modal.Context) {
		const banner = interaction.fields.getUploadedFiles('banner', false)?.at(0)?.url ?? '';
		// Force fetch due to caching issues.
		let me = await interaction.guild.members.fetchMe({ force: true });
		const oldBanner = me.displayBannerURL();

		try {
			me = await interaction.guild.members.editMe({ banner });
		} catch {
			const translations = translate(interaction.locale).commands['bot-profile'].command.modals.banner.response.errors
				.unknown;

			return interaction.editReply({
				embeds: [
					super.userEmbedError(interaction.member, translations.title()).setDescription(translations.description()),
				],
			});
		}

		const translations = translate(interaction.locale).commands['bot-profile'].command.modals.banner.response.success;
		const member = interaction.member.toString();
		const newBanner = me.displayBannerURL();
		const container = new ContainerBuilder()
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

			container.addMediaGalleryComponents(builder);
		}

		return interaction.editReply({
			components: [super.container(container)],
			flags: [MessageFlags.IsComponentsV2],
		});
	}
}
