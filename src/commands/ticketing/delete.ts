import { RowDataPacket } from 'mysql2';
import {
	memberNicknameMention,
	SlashCommandBuilder
} from '@discordjs/builders';
import { MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import { Command, Tables } from '../../types';

export const category: Command['category'] = 'Ticketing';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('delete')
	.setDescription(
		'Deletes the support ticket, messages might be saved if logs are on'
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (
			!interaction.channel!.isThread() &&
			!(interaction.channel instanceof TextChannel)
		) {
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

		let isSupportTicket = false;
		const authorId = interaction.channel.name.split('-').at(-1)!;
		const hasAuthorInName = interaction.channel.isThread()
			? interaction.channel.members.resolve(authorId)
			: interaction.channel.members.has(authorId);

		// messy code but it works
		if (hasAuthorInName) {
			if (record.UseTextChannels) {
				if (interaction.channel.parentId === record.SupportCategory) {
					isSupportTicket = true;
				}
			} else {
				if (
					interaction.channel.parentId === record.SupportChannel ||
					(interaction.channel.parent!.name.toLowerCase() === 'support' &&
						record.SupportChannel === '0')
				) {
					isSupportTicket = true;
				}
			}
		}

		if (isSupportTicket) {
			const managers = await interaction.guild!.roles.fetch(record.RoleID);

			if (!managers?.members.has(interaction.user.id)) {
				return interaction.reply({
					content: 'You need to be a ticketing manager to delete this ticket',
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

				const content = `Subject: ${subject}\n\n` + messages.join('');
				const attachment = new MessageAttachment(
					Buffer.from(content, 'utf8'),
					`Ticketer-${Date.now()}.txt`
				);

				embed.setDescription(
					`${memberNicknameMention(interaction.user.id)} deleted a ticket`
				);
				embed.addField('Name of Ticket', interaction.channel.name);
				embed.addField(
					'Message History',
					'The message history can be found in the attachment above'
				);

				logsChannel.send({ embeds: [embed], files: [attachment] });

				const user = interaction.guild!.members.resolve(authorId);

				if (user && !managers.members.has(user.id)) {
					embed.setDescription(
						`${memberNicknameMention(
							interaction.user.id
						)} deleted your support ticket in ${interaction.guild!.name}`
					);
					user.send({ embeds: [embed], files: [attachment] });
				}
			}

			interaction.channel.delete();
		} else {
			return interaction.reply({
				content:
					'You may only delete support tickets which are using the current type of ticket channel (threads/text channel)',
				ephemeral: true
			});
		}
	} catch (err) {
		console.error(err);
	}
};
