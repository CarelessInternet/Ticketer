import { RowDataPacket } from 'mysql2';
import {
	channelMention,
	inlineCode,
	memberNicknameMention,
	roleMention,
	SlashCommandBuilder
} from '@discordjs/builders';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { ChannelType } from 'discord-api-types';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import { Command, Tables } from '../../types';

export const category: Command['category'] = 'Staff';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('ticket-config')
	.setDescription('Edit the ticketing configuraton')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('managers')
			.setDescription(
				'Specifies the managers of the tickets. They will automatically get added to each ticket'
			)
			.addRoleOption((option) =>
				option
					.setName('role')
					.setDescription('The role that manages tickets')
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('support-channel')
			.setDescription(
				"Specifies the support channel, this is not required if there is a channel named 'support'"
			)
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('The channel for creating tickets')
					.setRequired(true)
					.addChannelTypes([ChannelType.GuildText, ChannelType.GuildNews])
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('logs-channel')
			.setDescription(
				'Specifies the logs channel, the bot sends a message on ticket activity'
			)
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('The channel for posting logs')
					.setRequired(true)
					.addChannelTypes([ChannelType.GuildText, ChannelType.GuildNews])
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('reply-embed')
			.setDescription(
				"Toggle to have the 'ticket created' message hidden or not"
			)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (!interaction.memberPermissions?.has(['MANAGE_GUILD'])) {
			return interaction.reply({
				content: 'You need the manage server permission to run this command',
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

		const embed = new MessageEmbed()
			.setColor('DARK_GREEN')
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
			.setTimestamp()
			.setFooter(`Version ${version}`);

		switch (interaction.options.getSubcommand()) {
			case 'managers': {
				const role = interaction.options.getRole('role') as Role;
				if (role.name === '@everyone') {
					return interaction.reply({
						content: 'Role cannot be @ everyone',
						ephemeral: true
					});
				}

				if (!record) {
					await conn.execute(
						'INSERT INTO TicketingManagers (GuildID, RoleID) VALUES (?, ?)',
						[interaction.guildId, role.id]
					);
				} else {
					await conn.execute(
						'UPDATE TicketingManagers SET RoleID = ? WHERE GuildID = ?',
						[role.id, interaction.guildId]
					);
				}

				embed.setTitle('Changed Managers');

				if (record && record.RoleID !== '0') {
					embed.setDescription(
						`${memberNicknameMention(
							interaction.user.id
						)} changed managers from ${roleMention(
							record.RoleID
						)} to ${roleMention(role.id)}`
					);
				} else {
					embed.setDescription(
						`${memberNicknameMention(
							interaction.user.id
						)} changed managers to ${roleMention(role.id)}`
					);
				}

				return interaction.reply({ embeds: [embed] });
			}
			case 'support-channel': {
				const channel = interaction.options.getChannel(
					'channel'
				) as TextChannel;

				if (!record) {
					return interaction.reply({
						content:
							'You need to create the managers first before editing this config',
						ephemeral: true
					});
				}

				await conn.execute(
					'UPDATE TicketingManagers SET SupportChannel = ? WHERE GuildID = ?',
					[channel.id, interaction.guildId]
				);
				embed.setTitle('Changed Support Channel');

				if (record.SupportChannel !== '0') {
					embed.setDescription(
						`${memberNicknameMention(
							interaction.user.id
						)} changed the support channel from ${channelMention(
							record.SupportChannel
						)} to ${channelMention(channel.id)}`
					);
				} else {
					embed.setDescription(
						`${memberNicknameMention(
							interaction.user.id
						)} changed the support channel to ${channelMention(channel.id)}`
					);
				}

				return interaction.reply({ embeds: [embed] });
			}
			case 'logs-channel': {
				const channel = interaction.options.getChannel(
					'channel'
				) as TextChannel;

				if (!record) {
					return interaction.reply({
						content:
							'You need to create the managers first before editing this config',
						ephemeral: true
					});
				}

				await conn.execute(
					'UPDATE TicketingManagers SET LogsChannel = ? WHERE GuildID = ?',
					[channel.id, interaction.guildId]
				);
				embed.setTitle('Changed Logs Channel');

				if (record.LogsChannel !== '0') {
					embed.setDescription(
						`${memberNicknameMention(
							interaction.user.id
						)} changed the logs channel from ${channelMention(
							record.LogsChannel
						)} to ${channelMention(channel.id)}`
					);
				} else {
					embed.setDescription(
						`${memberNicknameMention(
							interaction.user.id
						)} changed the logs channel to ${channelMention(channel.id)}`
					);
				}

				return interaction.reply({ embeds: [embed] });
			}
			case 'reply-embed': {
				if (!record) {
					return interaction.reply({
						content:
							'You need to create the managers first before editing this config',
						ephemeral: true
					});
				}

				await conn.execute(
					'UPDATE TicketingManagers SET ReplyEmbed = ? WHERE GuildID = ?',
					[!record.ReplyEmbed, interaction.guildId]
				);

				embed.setTitle('Changed Reply Embed Option');
				embed.setDescription(
					`${memberNicknameMention(
						interaction.user.id
					)} changed reply embeds to ${inlineCode(
						record.ReplyEmbed ? 'hidden' : 'shown'
					)}`
				);

				return interaction.reply({ embeds: [embed] });
			}
			default:
				break;
		}
	} catch (err) {
		console.error(err);
	}
};
