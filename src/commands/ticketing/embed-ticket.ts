import type { RowDataPacket } from 'mysql2';
import {
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	type TextChannel
} from 'discord.js';
import { inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord-api-types/v9';
import { conn, handleTicketCreation } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Ticketing',
	data: new SlashCommandBuilder()
		.setName('embed-ticket')
		.setDescription(
			'Send an embed with buttons to create a ticket in a specified channel'
		)
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('The channel where the ticket embed will be in')
				.setRequired(true)
				.addChannelType(ChannelType.GuildText)
		),
	execute: async function ({ interaction }) {
		try {
			if (
				!interaction.memberPermissions?.has(['MANAGE_CHANNELS', 'MANAGE_GUILD'])
			) {
				return interaction.reply({
					content:
						'You need the manage channels and guild permission to run this command',
					ephemeral: true
				});
			}

			const [rows] = await conn.execute(
				'SELECT * FROM TicketingManagers WHERE GuildID = ?',
				[interaction.guildId]
			);
			const record = (
				rows as RowDataPacket[]
			)[0] as Tables.TicketingManagers | null;

			if (!record) {
				return interaction.reply({
					content: 'No ticket record could be found, please create one',
					ephemeral: true
				});
			}

			const channel = interaction.options.getChannel('channel')! as TextChannel;

			if (
				!channel.permissionsFor(interaction.guild!.me!).has(['SEND_MESSAGES'])
			) {
				return interaction.reply({
					content: 'I need the send messages permission for that channel',
					ephemeral: true
				});
			}

			const notes = [
				'You can only have one ticket opened at a time',
				'By using the button, the bot will not be able to provide the subject of the ticket',
				'You can use the buttons in the ticket channel to delete (and archive if in a thread) the ticket'
			].map((txt) => `- ${txt}`);

			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setTitle('Create Support Ticket')
				.addField(
					'Usage',
					`Create a support ticket by either clicking the button below, or by using the command ${inlineCode(
						'/ticket'
					)}`
				)
				.addField('Notes', notes.join('\n'))
				.setTimestamp();
			const row = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId(this.components!.customIds![0])
					.setStyle('PRIMARY')
					.setEmoji('🎟️')
					.setLabel('Create Ticket')
			);

			// text channel based ticketing
			if (record.SupportCategory !== '0' && record.UseTextChannels) {
				const msg = await channel.send({ embeds: [embed], components: [row] });
				await msg.pin();

				if (channel.lastMessage?.system && channel.lastMessage.deletable) {
					await channel.lastMessage.delete();
				}

				interaction.reply({
					content: 'Ticket embed successfully sent!',
					ephemeral: true
				});
			} else {
				const supportChannelWithoutRecord =
					interaction.guild!.channels.cache.find(
						(channel) =>
							channel.name === 'support' && channel.type === 'GUILD_TEXT'
					);
				const supportChannelWithRecord = interaction.guild!.channels.resolve(
					record.SupportChannel
				);

				// thread based ticketing
				if (supportChannelWithRecord || supportChannelWithoutRecord) {
					const msg = await channel.send({
						embeds: [embed],
						components: [row]
					});
					await msg.pin();

					if (channel.lastMessage?.system && channel.lastMessage.deletable) {
						await channel.lastMessage.delete();
					}

					interaction.reply({
						content: 'Ticket embed successfully sent!',
						ephemeral: true
					});
				} else {
					interaction.reply({
						content: 'Please specify a channel or category for tickets',
						ephemeral: true
					});
				}
			}
		} catch (err) {
			console.error(err);
		}
	},
	components: {
		customIds: ['button_create_ticket'],
		execute: async ({ interaction }) => {
			try {
				const [rows] = await conn.execute(
					'SELECT * FROM TicketingManagers WHERE GuildID = ?',
					[interaction.guildId]
				);
				const record = (
					rows as RowDataPacket[]
				)[0] as Tables.TicketingManagers | null;

				if (!record) {
					return interaction.reply({
						content: 'No ticket record could be found, please create one',
						ephemeral: true
					});
				}

				const managers = await interaction.guild!.roles.fetch(record.RoleID);

				if (!managers) {
					return interaction.reply({
						content: 'No manager role could be found',
						ephemeral: true
					});
				}

				handleTicketCreation(interaction, managers, record);
			} catch (err) {
				console.error(err);
			}
		}
	}
};

export default command;
