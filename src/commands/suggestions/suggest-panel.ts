import type { RowDataPacket } from 'mysql2';
import {
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	Modal,
	TextInputComponent,
	type ModalActionRowComponent,
	type TextChannel
} from 'discord.js';
import { inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord-api-types/v9';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Suggestions',
	data: new SlashCommandBuilder()
		.setName('suggest-panel')
		.setDescription('Send a panel (embed) with a button to post a suggestion')
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('The channel where the suggestion panel will be in')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		),
	execute: async function ({ interaction }) {
		try {
			if (!interaction.memberPermissions?.has(['MANAGE_CHANNELS', 'MANAGE_GUILD'])) {
				return interaction.reply({
					content: 'You need the manage channels and guild permission to run this command',
					ephemeral: true
				});
			}

			const [rows] = await conn.execute('SELECT * FROM Suggestions WHERE GuildID = ?', [
				interaction.guildId
			]);
			const record = (rows as RowDataPacket[])[0] as Tables.Suggestions | null;

			if (!record) {
				return interaction.reply({
					content: 'No suggestion record could be found, please create one',
					ephemeral: true
				});
			}

			const channel = interaction.options.getChannel('channel')! as TextChannel;

			if (!channel.permissionsFor(interaction.guild!.me!).has(['SEND_MESSAGES'])) {
				return interaction.reply({
					content: 'I need the send messages permission for that channel',
					ephemeral: true
				});
			}

			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setTitle('Create Suggestion')
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			embed.setDescription(
				record.PanelInformation ||
					`Post a suggestion using the button below or by using the command ${inlineCode(
						'/suggest'
					)}!`
			);

			const row = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId(this.components!.customIds[0])
					.setStyle('PRIMARY')
					.setEmoji('💡')
					.setLabel('Create Suggestion')
			);

			const msg = await channel.send({ embeds: [embed], components: [row] });
			await msg.pin();

			if (channel.lastMessage?.system && channel.lastMessage.deletable) {
				await channel.lastMessage.delete();
			}

			interaction.reply({
				content: 'Suggestion panel sent successfully!',
				ephemeral: true
			});
		} catch (err) {
			console.error(err);
		}
	},
	components: {
		customIds: ['button_suggest_create'],
		execute: function ({ interaction }) {
			try {
				const title = new MessageActionRow<ModalActionRowComponent>().addComponents(
					new TextInputComponent()
						.setCustomId('modal_suggest_title')
						.setLabel('Title')
						.setPlaceholder('Enter the title of the suggestion.')
						.setStyle('SHORT')
						.setMaxLength(100)
						.setRequired(true)
				);
				const description = new MessageActionRow<ModalActionRowComponent>().addComponents(
					new TextInputComponent()
						.setCustomId('modal_suggest_description')
						.setLabel('Description')
						.setPlaceholder('Enter the description of the suggestion.')
						.setStyle('PARAGRAPH')
						.setMaxLength(4000)
						.setRequired(true)
				);

				const modal = new Modal()
					.setCustomId('modal_suggest')
					.setTitle('Suggestion')
					.addComponents(title, description);

				interaction.showModal(modal);
			} catch (err) {
				console.error(err);
			}
		}
	}
};

export default command;
