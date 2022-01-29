import {
	MessageEmbed,
	type NewsChannel,
	type CommandInteraction,
	type Role,
	TextChannel,
	type CategoryChannel,
	type ThreadChannel,
	type MessageComponentInteraction
} from 'discord.js';
import {
	channelMention,
	memberNicknameMention,
	roleMention,
	time
} from '@discordjs/builders';
import { version } from '../../package.json';
import type { Tables, TicketChannel } from '../types';

type SupportChannel = TextChannel | NewsChannel;

export const handleTicketCreation = async (
	interaction: CommandInteraction | MessageComponentInteraction,
	managers: Role,
	record: Tables.TicketingManagers,
	subject = 'None'
) => {
	try {
		const name = `ticket-${interaction.user.id}`;

		const supportChannelWithoutRecord = interaction.guild!.channels.cache.find(
			(channel) =>
				(channel.name.toLowerCase() === 'support' &&
					channel.type === 'GUILD_TEXT') ||
				channel.type === 'GUILD_NEWS'
		) as SupportChannel | null;
		const supportChannel =
			record.SupportChannel === '0'
				? supportChannelWithoutRecord
				: <SupportChannel | null>(
						await interaction.guild!.channels.fetch(record.SupportChannel)
				  );

		// for text channel based ticketing
		if (record.SupportCategory !== '0' && record.UseTextChannels) {
			const channelCategory = (await interaction.guild!.channels.fetch(
				record.SupportCategory
			)) as CategoryChannel | null;

			if (!channelCategory) {
				return interaction.reply({
					content: 'No support category channel found',
					ephemeral: true
				});
			}
			if (channelCategory.children.find((channel) => channel.name === name)) {
				return interaction.reply({
					content: 'Please close your previous ticket before opening a new one',
					ephemeral: true
				});
			}
			if (!channelCategory.viewable || !channelCategory.manageable) {
				return interaction.reply({
					content:
						'I cannot view/manage the category channel, please give me the permissions to view it',
					ephemeral: true
				});
			}

			const channel = await channelCategory.createChannel(name, {
				type: 'GUILD_TEXT',
				permissionOverwrites: [
					{
						id: interaction.user,
						allow: [
							'VIEW_CHANNEL',
							'SEND_MESSAGES',
							'READ_MESSAGE_HISTORY',
							'USE_APPLICATION_COMMANDS'
						]
					},
					{
						id: managers,
						allow: [
							'VIEW_CHANNEL',
							'SEND_MESSAGES',
							'READ_MESSAGE_HISTORY',
							'USE_APPLICATION_COMMANDS'
						]
					},
					{
						id: interaction.guild!.roles.everyone,
						deny: ['VIEW_CHANNEL']
					}
				]
			});

			handleRest(interaction, channel, managers, record, subject);
		}
		// for thread based ticketing
		else if (supportChannel) {
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

			const channel = supportChannel;
			if (
				channel!.threads.cache.find(
					(thread) => thread.name === name && !thread.archived
				)
			) {
				return interaction.reply({
					content:
						'You must close your previous ticket before opening a new one',
					ephemeral: true
				});
			}

			let thread: ThreadChannel;
			const reason = `Ticket Subject: ${subject}`;

			if (channel instanceof TextChannel) {
				thread = await channel.threads.create({
					name,
					reason,
					autoArchiveDuration: 'MAX',
					type: interaction.guild!.features.find(
						(feature) => feature === 'PRIVATE_THREADS'
					)
						? 'GUILD_PRIVATE_THREAD'
						: 'GUILD_PUBLIC_THREAD',
					invitable: false
				});
			} else {
				thread = await channel!.threads.create({
					name,
					reason,
					autoArchiveDuration: 'MAX'
				});
			}

			handleRest(interaction, thread, managers, record, subject);
		} else {
			return interaction.reply({
				content: 'Tickets are only allowed in the ticket channel',
				ephemeral: true
			});
		}
	} catch (err) {
		console.error(err);
	}
};

const handleRest = async (
	interaction: CommandInteraction | MessageComponentInteraction,
	channel: TicketChannel,
	managers: Role,
	record: Tables.TicketingManagers,
	subject: string
) => {
	try {
		const onlineManagers = managers.members.filter(
			(manager) =>
				manager.presence?.status === 'online' ||
				manager.presence?.status === 'idle' ||
				manager.presence?.status === 'dnd'
		);
		const presences = onlineManagers.map((manager) => {
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

		const channelEmbed = new MessageEmbed()
			.setColor('DARK_GREEN')
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true })
			})
			.setTitle('Support Ticket')
			.setDescription(
				`${memberNicknameMention(
					interaction.user.id
				)} created a new support ticket`
			)
			.addField('Subject', subject)
			.addField(
				'Available Managers',
				presences?.length ? presences.join('\n') : 'Unknown'
			)
			.addField('Ticket Date', time(channel.createdAt, 'R'))
			.setTimestamp();

		if (record.LogsChannel !== '0') {
			channelEmbed.setFooter({
				text: `Message logs are on, please be careful of what you say! Version ${version}`
			});
		} else {
			channelEmbed.setFooter({ text: `Version ${version}` });
		}

		const msg = await channel.send({
			embeds: [channelEmbed],
			...(channel.isThread() && {
				content: roleMention(managers.id),
				allowedMentions: { roles: [managers.id] }
			})
		});
		await msg.pin();

		if (channel.lastMessage?.system && channel.lastMessage.deletable) {
			await channel.lastMessage.delete();
		}

		if (channel.isThread()) {
			channel.members.add(interaction.user.id);
		}

		const ticketEmbed = new MessageEmbed()
			.setColor('DARK_GREEN')
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true })
			})
			.setTitle('Ticket Created')
			.setDescription(
				`Your support ticket has been successfully created! View it at ${channelMention(
					channel.id
				)}`
			)
			.addField('Subject', subject)
			.addField('Name of Ticket', channel.name)
			.setTimestamp()
			.setFooter({ text: `Version ${version}` });

		interaction.reply({
			embeds: [ticketEmbed],
			...((!record.ReplyEmbed || interaction.isMessageComponent()) && {
				ephemeral: true
			})
		});

		if (record.LogsChannel !== '0') {
			ticketEmbed.setDescription(
				`${memberNicknameMention(
					interaction.user.id
				)} has created a ticket! View it at ${channelMention(channel.id)}`
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
	} catch (err) {
		console.error(err);
	}
};
