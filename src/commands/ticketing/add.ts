import { RowDataPacket } from 'mysql2';
import {
	memberNicknameMention,
	SlashCommandBuilder
} from '@discordjs/builders';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import { Command, Tables } from '../../types';

export const category: Command['category'] = 'Ticketing';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('add')
	.setDescription('Add a user to the ticket')
	.addUserOption((option) =>
		option
			.setName('user')
			.setDescription('The user to add to the ticket')
			.setRequired(true)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (!(interaction.channel instanceof TextChannel)) {
			return interaction.reply({
				content: 'You can only use this command in a ticket text channel',
				ephemeral: true
			});
		}
		if (
			!interaction.guild!.me!.permissions.has([
				'MANAGE_ROLES',
				'MANAGE_CHANNELS'
			])
		) {
			return interaction.reply({
				content:
					'I need the manage role and channels permission to run this command',
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

		if (!record || !record.UseTextChannels || record.SupportCategory === '0') {
			return interaction.reply({
				content:
					'No record, ticket channel type set to threads, or support category channel could be found',
				ephemeral: true
			});
		}

		if (interaction.channel.parentId === record.SupportCategory) {
			const managers = await interaction.guild!.roles.fetch(record.RoleID);
			const user = interaction.options.getMember('user') as GuildMember;

			if (!managers?.members.has(interaction.user.id)) {
				return interaction.reply({
					content: 'You need to be a ticketing manager to use this command',
					ephemeral: true
				});
			}

			if (interaction.channel.members.has(user.id)) {
				return interaction.reply({
					content: 'User is already in the ticket',
					ephemeral: true
				});
			}

			await interaction.channel.permissionOverwrites.create(user.id, {
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true,
				READ_MESSAGE_HISTORY: true,
				USE_APPLICATION_COMMANDS: true
			});

			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor(
					interaction.user.tag,
					interaction.user.displayAvatarURL({ dynamic: true })
				)
				.setTitle('Added User to Ticket')
				.setDescription(
					`${memberNicknameMention(
						interaction.user.id
					)} added a user to the ticket: ${memberNicknameMention(user.id)}`
				)
				.setTimestamp()
				.setFooter(`Version ${version}`);

			interaction.reply({ embeds: [embed] });
		}
	} catch (err) {
		console.error(err);
	}
};
