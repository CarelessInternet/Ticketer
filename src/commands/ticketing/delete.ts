import PasteAPI from 'pastebin-api';
import { RowDataPacket } from 'mysql2';
import {
	hyperlink,
	memberNicknameMention,
	SlashCommandBuilder
} from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import { Command, Tables } from '../../types';

const pasteClient = new PasteAPI(process.env.PASTEBIN_API_KEY);

export const category: Command['category'] = 'Ticketing';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('delete')
	.setDescription(
		'Deletes the support ticket, messages might be saved if logs are on'
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (!interaction.channel!.isThread()) {
			return interaction.reply({
				content: 'You must use this command in a support ticket',
				ephemeral: true
			});
		}
		if (
			!interaction.guild!.me!.permissions.has([
				'MANAGE_THREADS',
				'SEND_MESSAGES_IN_THREADS',
				'READ_MESSAGE_HISTORY'
			])
		) {
			return interaction.reply({
				content:
					'I need the manage threads, send messages in threads permission, and read message history to run this command',
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

		if (!record || record.RoleID === '0') {
			return interaction.reply({
				content:
					'No ticketing config or available managers role could be found, cannot delete ticket',
				ephemeral: true
			});
		}

		if (
			interaction.channel.parentId === record.SupportChannel ||
			(interaction.channel.parent!.name.toLowerCase() === 'support' &&
				record.SupportChannel === '0')
		) {
			const managers = await interaction.guild!.roles.fetch(record.RoleID);
			const name = `ticket-${interaction.user.id}`;

			if (
				name !== interaction.channel.name &&
				!managers?.members.has(interaction.user.id)
			) {
				return interaction.reply({
					content:
						'You may not delete this thread, you are not the original author nor a manager',
					ephemeral: true
				});
			}

			const embed = new MessageEmbed()
				.setColor('RED')
				.setAuthor(
					interaction.user.tag,
					interaction.user.displayAvatarURL({ dynamic: true })
				)
				.setTitle('Ticket Deleted')
				.setDescription(
					`${memberNicknameMention(
						interaction.user.id
					)} deleted the support ticket`
				)
				.setTimestamp()
				.setFooter(`Version ${version}`);

			await interaction.reply({ embeds: [embed] });

			if (record.LogsChannel !== '0') {
				const logsChannel = await interaction.guild!.channels.fetch(
					record.LogsChannel
				);

				if (!logsChannel?.isText()) return;
				if (
					!logsChannel
						.permissionsFor(interaction.guild!.me!)
						.has(['SEND_MESSAGES'])
				)
					return;

				const { cache } = interaction.channel.messages;
				const messages = cache.map((msg) => {
					if (msg.author?.id !== interaction.client.user!.id) {
						const user = msg.author?.tag ?? 'Unknown';
						const content = msg.content ?? 'No message content';

						return `${user}: ${content}\n`;
					}
				});

				const pin = cache.first();
				const subject =
					pin?.author.id === interaction.client.user!.id
						? pin.embeds?.[0]?.fields?.[0]?.value
						: 'Not Found';

				const url = await pasteClient.createPaste({
					code: `Subject: ${subject}\n\n` + messages.join(' '),
					name: `Ticketer-${Date.now()}`,
					expireDate: '1W'
				});

				embed.setDescription(
					`${memberNicknameMention(interaction.user.id)} deleted a ticket`
				);
				embed.addField('Name of Ticket', interaction.channel.name);
				embed.addField('Link to Message History', hyperlink(url, url));

				logsChannel.send({ embeds: [embed] });
			}

			interaction.channel.delete();
		} else {
			return interaction.reply({
				content: 'You may only close support tickets',
				ephemeral: true
			});
		}
	} catch (err) {
		console.error(err);
	}
};
