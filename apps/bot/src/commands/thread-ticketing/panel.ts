import { Command, container, customId, Modal, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import {
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	Colors,
	HeadingLevel,
	heading,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	PermissionFlagsBits,
	SectionBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { prettifyError, z } from 'zod';
import { discordEmojiFromId, extractDiscordEmoji } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('panel')
		.setDescription('Create a ticket panel in a specific channel.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads);

	public execute({ interaction }: Command.Context<'chat'>) {
		const channelInput = new LabelBuilder()
			.setLabel('Channel')
			.setDescription('Choose the channel where the panel will be displayed.')
			.setChannelSelectMenuComponent(
				new ChannelSelectMenuBuilder()
					.setCustomId(customId('channel'))
					.setRequired(true)
					.setMinValues(1)
					.setMaxValues(1),
			);
		const titleInput = new LabelBuilder()
			.setLabel('Title')
			.setDescription('Write a title to be used in the ticket panel.')
			.setTextInputComponent(
				new TextInputBuilder()
					.setCustomId(customId('title'))
					.setRequired(true)
					.setMinLength(1)
					.setMaxLength(200)
					.setStyle(TextInputStyle.Short),
			);
		const descriptonInput = new LabelBuilder()
			.setLabel('Description')
			.setDescription('Write a description to be used in the ticket panel.')
			.setTextInputComponent(
				new TextInputBuilder()
					.setCustomId(customId('description'))
					.setRequired(true)
					.setMinLength(1)
					.setMaxLength(2000)
					.setStyle(TextInputStyle.Paragraph),
			);
		const buttonEmojiInput = new LabelBuilder()
			.setLabel('Buttom Emoji')
			.setDescription("Write an emoji for the button used to create a ticket. For your server's emoji, write its ID!")
			.setTextInputComponent(
				new TextInputBuilder()
					.setCustomId(customId('button_emoji'))
					.setRequired(false)
					.setMinLength(1)
					.setMaxLength(21)
					.setStyle(TextInputStyle.Short),
			);
		const buttonLabelInput = new LabelBuilder()
			.setLabel('Button Label')
			.setDescription('Write a label for the button used to create a ticket.')
			.setTextInputComponent(
				new TextInputBuilder()
					.setCustomId(customId('button_label'))
					.setRequired(true)
					.setMinLength(1)
					.setMaxLength(80)
					.setStyle(TextInputStyle.Short),
			);

		const modal = new ModalBuilder()
			.setCustomId(customId('ticket_threads_categories_create_panel'))
			.setTitle('Ticket Panel Details')
			.setLabelComponents(channelInput, titleInput, descriptonInput, buttonEmojiInput, buttonLabelInput);

		return interaction.showModal(modal);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [customId('ticket_threads_categories_create_panel')];

	public async execute({ interaction }: Modal.Context) {
		const channel = interaction.fields.getSelectedChannels('channel', true).at(0);

		if (!channel?.isTextBased()) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'The specified channel is not text based.',
						member: interaction.member,
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		const { success, data, error } = z
			.object({
				title: z.string().min(1).max(100),
				description: z.string().min(1).max(2000),
				buttonLabel: z.string().min(1).max(80),
			})
			.safeParse({
				title: interaction.fields.getTextInputValue('title'),
				description: interaction.fields.getTextInputValue('description'),
				buttonLabel: interaction.fields.getTextInputValue('button_label'),
			});

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
						title: 'One or multiple of the modal fields are invalid.',
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		let { emoji, isSnowflake } = extractDiscordEmoji(interaction.fields.getTextInputValue('button_emoji'));
		await interaction.deferReply();

		if (isSnowflake) {
			const fetchedEmoji = await discordEmojiFromId(interaction, emoji);

			if (!fetchedEmoji?.id) {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: 'The emoji ID is invalid.',
							member: interaction.member,
						}),
					],
				});
			}

			emoji = fetchedEmoji.id;
		}

		emoji ||= '🎫';
		const me = await interaction.guild.members.fetchMe();

		if (!channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: `I do not have the view channel and send messages permission in ${channel}.`,
						member: interaction.member,
					}),
				],
			});
		}

		const reply = container({
			builder: (cont) =>
				cont
					.setAccentColor(Colors.Aqua)
					.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading(data.title, HeadingLevel.One)))
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(new TextDisplayBuilder().setContent(data.description))
							.setButtonAccessory(
								new ButtonBuilder()
									.setCustomId(customId('ticket_threads_categories_create_list_panel'))
									.setEmoji(emoji)
									.setLabel(data.buttonLabel)
									.setStyle(ButtonStyle.Primary),
							),
					),
			client: interaction.client,
		});

		const message = await channel.send({ components: [reply], flags: [MessageFlags.IsComponentsV2] });

		void interaction.editReply({
			embeds: [
				userEmbed(interaction)
					.setTitle('Sent the Ticket Panel')
					.setDescription(
						`The thread ticket panel has been sent successfully in ${channel}. View the message at ${message.url}!`,
					),
			],
		});
	}
}
