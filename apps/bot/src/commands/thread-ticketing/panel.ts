import {
	Command,
	container,
	customId,
	DeferReply,
	dynamicCustomId,
	extractCustomId,
	Modal,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import {
	ButtonBuilder,
	ButtonStyle,
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
import { extractEmoji, fetchChannel } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('panel')
		.setDescription('Create a ticket panel in a specific channel.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads)
		.addChannelOption((option) =>
			option.setName('channel').setDescription('Choose the channel where the panel goes to.').setRequired(true),
		);

	public execute({ interaction }: Command.Context<'chat'>) {
		const channel = interaction.options.getChannel('channel', true);

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
			.setDescription('Write an emoji for the button used to create a ticket.')
			.setTextInputComponent(
				new TextInputBuilder()
					.setCustomId(customId('button_emoji'))
					.setRequired(false)
					.setMinLength(1)
					.setMaxLength(8)
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
			.setCustomId(customId('ticket_threads_categories_create_panel', channel.id))
			.setTitle('Ticket Panel Details')
			.setLabelComponents(titleInput, descriptonInput, buttonEmojiInput, buttonLabelInput);

		return interaction.showModal(modal);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_threads_categories_create_panel')];

	@DeferReply()
	public async execute({ interaction }: Modal.Context) {
		const { customId: interactionId, fields, guild } = interaction;

		const rawButtonEmoji = fields.getTextInputValue('button_emoji');
		const buttonEmoji = extractEmoji(rawButtonEmoji) ?? '🎫';

		const { success, data, error } = z
			.object({
				title: z.string().min(1).max(100),
				description: z.string().min(1).max(2000),
				buttonLabel: z.string().min(1).max(80),
			})
			.safeParse({
				title: fields.getTextInputValue('title'),
				description: fields.getTextInputValue('description'),
				buttonLabel: fields.getTextInputValue('button_label'),
			});

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
						title: 'One or multiple of the modal fields are invalid.',
					}),
				],
			});
		}

		const { dynamicValue: channelId } = extractCustomId(interactionId, true);
		const channel = await fetchChannel(guild, channelId);

		if (!channel?.isTextBased()) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'The specified channel is not text based.',
						member: interaction.member,
					}),
				],
			});
		}

		const me = await guild.members.fetchMe();

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
									.setEmoji(buttonEmoji)
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
						`The thread ticket panel has successfully been sent in ${channel}. View the message at ${message.url}!`,
					),
			],
		});
	}
}
