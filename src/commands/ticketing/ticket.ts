import { RowDataPacket } from 'mysql2';
import {
	NewsChannel,
	TextChannel,
	ThreadChannel,
	MessageEmbed
} from 'discord.js';
import {
	SlashCommandBuilder,
	memberNicknameMention,
	time,
	channelMention
} from '@discordjs/builders';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import { Command, Tables } from '../../types';

export const category: Command['category'] = 'Ticketing';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('ticket')
	.setDescription('Creates a support ticket')
	.addStringOption((option) =>
		option
			.setName('subject')
			.setDescription('The subject/message of the ticket')
			.setRequired(true)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (!interaction.channel!.isText()) {
			return interaction.reply({
				content: 'You must use this command in a valid text channel',
				ephemeral: true
			});
		}
		if (
			!interaction.guild!.me!.permissions.has([
				'MANAGE_THREADS',
				'CREATE_PUBLIC_THREADS',
				'CREATE_PRIVATE_THREADS',
				'SEND_MESSAGES_IN_THREADS',
				'MANAGE_MESSAGES'
			])
		) {
			return interaction.reply({
				content:
					'I need all thread permissions and manage messages to create tickets',
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
				content: 'I am missing the config for tickets',
				ephemeral: true
			});
		}

		const channel = interaction.channel as TextChannel | NewsChannel;

		if (
			channel.id === record.SupportChannel ||
			(channel.name.toLowerCase() === 'support' &&
				record.SupportChannel === '0')
		) {
			const subject = interaction.options.getString('subject')!;
			const name = `ticket-${interaction.user.id}`;

			if (
				channel.threads.cache.find(
					(thread) => thread.name === name && !thread.archived
				)
			) {
				return interaction.reply({
					content:
						'You must close your previous ticket before opening a new one',
					ephemeral: true
				});
			}

			if (record.RoleID === '0') {
				return interaction.reply({
					content: 'Missing the managers, please add them via ticket-config',
					ephemeral: true
				});
			}

			let thread: ThreadChannel;
			if (channel instanceof TextChannel) {
				thread = await channel.threads.create({
					name,
					autoArchiveDuration: 'MAX',
					reason: subject,
					type: interaction.guild!.features.find(
						(feature) => feature === 'PRIVATE_THREADS'
					)
						? 'GUILD_PRIVATE_THREAD'
						: 'GUILD_PUBLIC_THREAD',
					invitable: false
				});
			} else {
				thread = await channel.threads.create({
					name,
					autoArchiveDuration: 'MAX',
					reason: subject
				});
			}

			const managers = await interaction.guild!.roles.fetch(record.RoleID);
			const presences = managers?.members.map((manager) => {
				const mention = memberNicknameMention(manager.id);
				const status = manager.presence?.status;

				switch (status) {
					case 'online':
						return `🟢 ${mention}`;
					case 'idle':
						return `🟡 ${mention}`;
					case 'dnd':
						return `🔴 ${mention}`;
					default:
						return `⚫ ${mention}`;
				}
			});

			const threadEmbed = new MessageEmbed()
				.setColor('DARK_GREEN')
				.setAuthor(
					interaction.user.tag,
					interaction.user.displayAvatarURL({ dynamic: true })
				)
				.setTitle('Support Ticket')
				.setDescription(
					`${memberNicknameMention(
						interaction.user.id
					)} created a new support ticket`
				)
				.addField('Subject', subject)
				.addField('Statuses of Managers', presences?.join('\n') ?? 'Unknown')
				.addField('Ticket Date', time(thread.createdAt, 'R'))
				.setTimestamp();

			if (record.LogsChannel !== '0') {
				threadEmbed.setFooter(
					`Message logs are on, please be careful of what you say! Version ${version}`
				);
			} else {
				threadEmbed.setFooter(`Version ${version}`);
			}

			const msg = await thread.send({ embeds: [threadEmbed] });
			await msg.pin();

			if (thread.lastMessage?.system && thread.lastMessage.deletable) {
				await thread.lastMessage.delete();
			}

			managers?.members.forEach((manager) => thread.members.add(manager.id));
			thread.members.add(interaction.user.id);

			const ticketEmbed = new MessageEmbed()
				.setColor('DARK_GREEN')
				.setAuthor(
					interaction.user.tag,
					interaction.user.displayAvatarURL({ dynamic: true })
				)
				.setTitle('Ticket Created')
				.setDescription(
					`Your support ticket has been successfully created! View it at ${channelMention(
						thread.id
					)}`
				)
				.addField('Subject', subject)
				.addField('Name of Ticket', thread.name)
				.setTimestamp()
				.setFooter(`Version ${version}`);

			interaction.reply({
				embeds: [ticketEmbed],
				...(!record.ReplyEmbed && { ephemeral: true })
			});

			if (record.LogsChannel !== '0') {
				ticketEmbed.setDescription(
					`${memberNicknameMention(
						interaction.user.id
					)} has created a ticket! View it at ${channelMention(thread.id)}`
				);

				const logsChannel = await interaction.guild!.channels.fetch(
					record.LogsChannel
				)!;

				if (!logsChannel?.isText()) return;
				if (
					!logsChannel
						.permissionsFor(interaction.guild!.me!)
						.has(['SEND_MESSAGES'])
				)
					return;

				logsChannel.send({ embeds: [ticketEmbed] });
			}
		} else {
			return interaction.reply({
				content: 'Tickets are only allowed in the support/ticket channel',
				ephemeral: true
			});
		}
	} catch (err) {
		console.error(err);
	}
};
