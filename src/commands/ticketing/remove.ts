import type { RowDataPacket } from 'mysql2';
import { memberNicknameMention, SlashCommandBuilder } from '@discordjs/builders';
import { type GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Ticketing',
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove a user from the ticket')
		.addUserOption((option) =>
			option.setName('user').setDescription('The user to remove from the ticket').setRequired(true)
		),
	execute: async ({ interaction }) => {
		try {
			if (!(interaction.channel instanceof TextChannel)) {
				return interaction.reply({
					content: 'You can only use this command in a ticket text channel',
					ephemeral: true
				});
			}
			if (!interaction.guild!.me!.permissions.has(['MANAGE_ROLES', 'MANAGE_CHANNELS'])) {
				return interaction.reply({
					content: 'I need the manage role and channels permission to run this command',
					ephemeral: true
				});
			}

			const [rows] = await conn.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [
				interaction.guildId
			]);
			const record = (rows as RowDataPacket[])[0] as Tables.TicketingManagers | null;

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

				if (managers.members.has(user.id)) {
					return interaction.reply({
						content: 'User is a ticketing manager, cannot remove them from the ticket',
						ephemeral: true
					});
				}

				if (user.id === interaction.channel.name.split('-').at(-1)) {
					return interaction.reply({
						content: 'You may not kick the ticket author',
						ephemeral: true
					});
				}

				await interaction.channel.permissionOverwrites.create(user.id, {
					VIEW_CHANNEL: false
				});

				const embed = new MessageEmbed()
					.setColor('RANDOM')
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL({ dynamic: true })
					})
					.setTitle('Added User to Ticket')
					.setDescription(
						`${memberNicknameMention(
							interaction.user.id
						)} removed a user from the ticket: ${memberNicknameMention(user.id)}`
					)
					.setTimestamp()
					.setFooter({ text: `Version ${version}` });

				interaction.reply({ embeds: [embed] });
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
