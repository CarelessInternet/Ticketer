import {
	ActionRowBuilder,
	ContainerBuilder,
	FileUploadBuilder,
	HeadingLevel,
	LabelBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	ModalBuilder,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
	codeBlock,
	heading,
	inlineCode,
} from 'discord.js';
import { Command, Component, DeferReply, Modal } from '@ticketer/djs-framework';
import z, { prettifyError } from 'zod';

// TODO: localisation.

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('bot-profile')
		.setDescription("Modify the bot's profile on this server.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname | PermissionFlagsBits.ManageGuild);

	public execute({ interaction }: Command.Context<'chat'>) {
		void interaction.reply({
			components: [
				super.container((cont) =>
					cont
						.addTextDisplayComponents(new TextDisplayBuilder().setContent('Below are the configurations you can edit:'))
						.addActionRowComponents(
							new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
								new StringSelectMenuBuilder()
									.setCustomId(super.customId('bot_profile_menu'))
									.setMinValues(1)
									.setMaxValues(1)
									.setPlaceholder('Choose a field to change.')
									.setOptions(
										new StringSelectMenuOptionBuilder()
											.setEmoji('🪪')
											.setLabel('Display Name')
											.setDescription('Edit my name on the server.')
											.setValue('name'),
										new StringSelectMenuOptionBuilder()
											.setEmoji('📔')
											.setLabel('Bio')
											.setDescription('Edit my bio on the server.')
											.setValue('bio'),
										new StringSelectMenuOptionBuilder()
											.setEmoji('👤')
											.setLabel('Avatar')
											.setDescription('Edit my profile picture on the server.')
											.setValue('avatar'),
										new StringSelectMenuOptionBuilder()
											.setEmoji('🖼️')
											.setLabel('Banner')
											.setDescription('Edit my banner on the server.')
											.setValue('banner'),
									),
							),
						),
				),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
	}
}

export class SelectMenuInteraction extends Component.Interaction {
	public readonly customIds = [super.customId('bot_profile_menu')];

	public execute({ interaction }: Component.Context<'string'>) {
		switch (interaction.values.at(0)) {
			case 'name': {
				return interaction.showModal(
					new ModalBuilder()
						.setCustomId(super.customId('bot_profile_menu', 'name'))
						.setTitle('Edit Name')
						.setLabelComponents(
							new LabelBuilder()
								.setLabel('Nickname')
								.setDescription('Leave the input black to reset the name.')
								.setTextInputComponent(
									new TextInputBuilder()
										.setCustomId(super.customId('name'))
										.setRequired(false)
										.setMinLength(1)
										.setMaxLength(32)
										.setStyle(TextInputStyle.Short)
										.setPlaceholder('Ticketer'),
								),
						),
				);
			}
			case 'bio': {
				return interaction.showModal(
					new ModalBuilder()
						.setCustomId(super.customId('bot_profile_menu', 'bio'))
						.setTitle('Edit Bio')
						.setLabelComponents(
							new LabelBuilder()
								.setLabel('About Me*')
								.setDescription('* The bio cannot be reset to the default!')
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
						.setTitle('Edit Avatar')
						.setLabelComponents(
							new LabelBuilder()
								.setLabel('Profile Picture')
								.setDescription('Leave the input blank to reset the avatar.')
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
						.setTitle('Edit Banner')
						.setLabelComponents(
							new LabelBuilder()
								.setLabel('Banner')
								.setDescription('Leave the input blank to reset the banner.')
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
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.member).setDescription('The selected value could not be found.')],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}
}

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
				return context.interaction.reply({
					embeds: [
						super.userEmbedError(context.interaction.member).setDescription('The modal custom ID could not be found.'),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferReply()
	private async name({ interaction }: Modal.Context) {
		const {
			data: nick,
			error,
			success,
		} = z.string().min(0).max(32).safeParse(interaction.fields.getTextInputValue('name'));

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(prettifyError(error))],
			});
		}

		if (!interaction.appPermissions.has(PermissionFlagsBits.ChangeNickname)) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.member)
						.setDescription('I need the Change Nickname permission to edit my nickname.'),
				],
			});
		}

		let me = await interaction.guild.members.fetchMe();
		const oldName = me.displayName;

		me = await interaction.guild.members.editMe({ nick });

		return interaction.editReply({
			components: [
				super.container((cont) =>
					cont
						.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading('Changed Name', HeadingLevel.One)))
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${interaction.member.toString()} changed my display name from ${inlineCode(oldName)} to ${inlineCode(me.displayName)}.`,
							),
						),
				),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
	}

	@DeferReply()
	private async bio({ interaction }: Modal.Context) {
		const {
			data: bio,
			error,
			success,
		} = z.string().min(0).max(190).safeParse(interaction.fields.getTextInputValue('bio'));

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(prettifyError(error))],
			});
		}

		await interaction.guild.members.editMe({ bio });

		const container = new ContainerBuilder()
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading('Changed Bio', HeadingLevel.One)))
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`${interaction.member.toString()} changed my bio to${bio ? ':' : ' nothing.'}`,
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
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.member)
						.setDescription('The avatar could not be used for an unknown reason.'),
				],
			});
		}

		return interaction.editReply({
			components: [
				super.container((cont) =>
					cont
						.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading('Changed Avatar', HeadingLevel.One)))
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${interaction.member.toString()} changed my avatar from the left image to the right.`,
							),
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

	// TODO: oldBanner is always empty/undefined. Fix if possible.
	@DeferReply()
	private async banner({ interaction }: Modal.Context) {
		const banner = interaction.fields.getUploadedFiles('banner', false)?.at(0)?.url ?? '';
		let me = await interaction.guild.members.fetchMe();
		const oldBanner = me.displayBannerURL();

		try {
			me = await interaction.guild.members.editMe({ banner });
		} catch {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.member)
						.setDescription('The banner could not be used for an unknown reason.'),
				],
			});
		}

		const newBanner = me.displayBannerURL();
		const container = new ContainerBuilder()
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading('Changed Banner', HeadingLevel.One)))
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`${interaction.member.toString()} changed my banner ${
						oldBanner && newBanner
							? 'from the left image to the right'
							: oldBanner && !newBanner
								? 'from the image below to the default'
								: !oldBanner && newBanner
									? 'from the default image to the one below'
									: 'from the default image to the default'
					}.`,
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
