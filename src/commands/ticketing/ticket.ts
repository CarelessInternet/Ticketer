import type { RowDataPacket } from 'mysql2';
import {
	type CategoryChannel,
	type GuildChannel,
	type NewsChannel,
	type ThreadChannel,
	TextChannel,
	MessageEmbed,
	type CommandInteraction,
	type Role
} from 'discord.js';
import {
	SlashCommandBuilder,
	memberNicknameMention,
	time,
	channelMention
} from '@discordjs/builders';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Ticketing',
	data: new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Creates a support ticket')
		.addStringOption((option) =>
			option
				.setName('subject')
				.setDescription('The subject/message of the ticket')
				.setRequired(true)
		),
	execute: async ({ interaction }) => {
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

			if (record.RoleID === '0') {
				return interaction.reply({
					content: 'Missing the managers, please add them via ticket-config',
					ephemeral: true
				});
			}

			const preChannel = interaction.channel as GuildChannel;
			const subject = interaction.options.getString('subject')!;
			const name = `ticket-${interaction.user.id}`;

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
						content:
							'Please close your previous ticket before opening a new one',
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

				const managers = await interaction.guild!.roles.fetch(record.RoleID);

				if (!managers) {
					return interaction.reply({
						content: 'No manager role could be found',
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

				handleRest(interaction, subject, record, channel, managers);
			}
			// for thread based ticketing
			else if (
				preChannel.id === record.SupportChannel ||
				(preChannel.name.toLowerCase() === 'support' &&
					record.SupportChannel === '0')
			) {
				const channel = interaction.channel as TextChannel | NewsChannel;

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

				if (!managers) {
					return interaction.reply({
						content: 'No manager role could be found',
						ephemeral: true
					});
				}

				handleRest(interaction, subject, record, thread, managers);
			} else {
				return interaction.reply({
					content: 'Tickets are only allowed in the ticket channel',
					ephemeral: true
				});
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;

const handleRest = async (
	interaction: CommandInteraction,
	subject: string,
	record: Tables.TicketingManagers,
	channel: ThreadChannel | TextChannel,
	managers: Role
): Promise<void> => {
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

	const msg = await channel.send({ embeds: [channelEmbed] });
	await msg.pin();

	if (channel.lastMessage?.system && channel.lastMessage.deletable) {
		await channel.lastMessage.delete();
	}

	if (channel.isThread()) {
		managers.members.forEach((manager) => channel.members.add(manager.id));
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
		...(!record.ReplyEmbed && { ephemeral: true })
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
			!logsChannel.permissionsFor(interaction.guild!.me!).has(['SEND_MESSAGES'])
		)
			return;

		logsChannel.send({ embeds: [ticketEmbed] });
	}
};
