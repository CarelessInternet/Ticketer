import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
	channelMention,
} from 'discord.js';
import { Command, DeferReply, Modal } from '@ticketer/djs-framework';
import { extractEmoji } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('panel')
		.setDescription('Create a ticket panel in a specific channel.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads)
		.addChannelOption((option) =>
			option.setName('channel').setDescription('Choose the channel where the panel goes to.').setRequired(true),
		);

	public execute({ interaction }: Command.Context<'chat'>) {
		const channel = interaction.options.getChannel('channel', true);

		const titleInput = new TextInputBuilder()
			.setCustomId(super.customId('title'))
			.setLabel('Title')
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(200)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Write a title to be used in the ticket panel.');
		const descriptonInput = new TextInputBuilder()
			.setCustomId(super.customId('description'))
			.setLabel('Description')
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(2000)
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Write a description to be used in the ticket panel.');
		const buttonEmojiInput = new TextInputBuilder()
			.setCustomId(super.customId('button_emoji'))
			.setLabel('Button Emoji')
			.setRequired(false)
			.setMinLength(1)
			.setMaxLength(8)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Write an emoji for the button used to create a ticket.');
		const buttonLabelInput = new TextInputBuilder()
			.setCustomId(super.customId('button_label'))
			.setLabel('Button Label')
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(80)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Write a label for the button used to create a ticket.');

		const rows = [titleInput, descriptonInput, buttonEmojiInput, buttonLabelInput].map((input) =>
			new ActionRowBuilder<TextInputBuilder>().setComponents(input),
		);

		const modal = new ModalBuilder()
			.setCustomId(super.customId('ticket_threads_categories_create_panel', channel.id))
			.setTitle('Ticket Panel Descriptions')
			.setComponents(rows);

		return interaction.showModal(modal);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [super.dynamicCustomId('ticket_threads_categories_create_panel')];

	@DeferReply(false)
	public async execute({ interaction }: Modal.Context) {
		const { customId, fields, guild, user } = interaction;

		const title = fields.getTextInputValue('title');
		const description = fields.getTextInputValue('description');
		const rawButtonEmoji = fields.getTextInputValue('button_emoji');
		const buttonLabel = fields.getTextInputValue('button_label');
		const buttonEmoji = extractEmoji(rawButtonEmoji) ?? '🎫';

		const { dynamicValue: channelId } = super.extractCustomId(customId, true);
		const channel = await guild.channels.fetch(channelId);

		if (!channel?.isTextBased()) {
			return interaction.editReply({
				embeds: [super.userEmbedError(user).setDescription('The specified channel is not text based.')],
			});
		}

		const me = await guild.members.fetchMe();

		if (!channel.permissionsFor(me).has([PermissionFlagsBits.SendMessages])) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(user)
						.setDescription(`I do not have the send messages permission in ${channelMention(channel.id)}.`),
				],
			});
		}

		const embed = super.embed.setColor(Colors.Aqua).setTitle(title).setDescription(description);
		const button = new ButtonBuilder()
			.setCustomId(super.customId('ticket_threads_categories_create_panel_button'))
			.setEmoji(buttonEmoji)
			.setLabel(buttonLabel)
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder<ButtonBuilder>().setComponents(button);
		const message = await channel.send({ components: [row], embeds: [embed] });

		void interaction.editReply({
			embeds: [
				super
					.userEmbed(user)
					.setTitle('Sent the Ticket Panel')
					.setDescription(
						`The thread ticket panel has successfully been sent in ${channelMention(channel.id)}. View the message at ${
							message.url
						}!`,
					),
			],
		});
	}
}
