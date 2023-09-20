import {
	MessageEmbed,
	type CommandInteraction,
	type Role,
	TextChannel,
	type CategoryChannel,
	MessageActionRow,
	MessageButton,
	type ModalSubmitInteraction
} from 'discord.js';
import { channelMention, userMention, roleMention, time } from '@discordjs/builders';
import { version } from '../../package.json';
import type { Tables, TicketChannel } from '../types';

export const handleTicketCreation = async (
	interaction: CommandInteraction | ModalSubmitInteraction,
	managers: Role,
	record: Tables.TicketingManagers,
	subject: string
) => {
	try {
		// 300 is our specified max length of tickets' subjects
		subject = subject.length >= 300 ? `${subject.substring(0, 300 - 3)}...` : subject;
		const name = `ticket-${interaction.user.id}`;

		const supportChannelWithoutRecord = interaction.guild!.channels.cache.find(
			(channel) => channel.name.toLowerCase() === 'support' && channel.type === 'GUILD_TEXT'
		) as TextChannel | null;
		const supportChannel =
			record.SupportChannel === '0'
				? supportChannelWithoutRecord
				: <TextChannel | null>await interaction.guild!.channels.fetch(record.SupportChannel);

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
					content: 'I need all thread permissions and manage messages to create tickets',
					ephemeral: true
				});
			}

			const channel = supportChannel;
			if (channel!.threads.cache.find((thread) => thread.name === name && !thread.archived)) {
				return interaction.reply({
					content: 'You must close your previous ticket before opening a new one',
					ephemeral: true
				});
			}

			const thread = await channel.threads.create({
				name,
				autoArchiveDuration: 'MAX',
				type: record.PrivateThreads ? 'GUILD_PRIVATE_THREAD' : 'GUILD_PUBLIC_THREAD',
				invitable: false
			});

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
	interaction: CommandInteraction | ModalSubmitInteraction,
	channel: TicketChannel,
	managers: Role,
	record: Tables.TicketingManagers,
	subject: string
) => {
	try {
		const embeds: MessageEmbed[] = [];

		const channelEmbed = new MessageEmbed()
			.setColor('DARK_GREEN')
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true })
			})
			.setTitle('Support Ticket')
			.setDescription(`${userMention(interaction.user.id)} created a new support ticket`)
			.addField('Subject', subject)
			.addField('Ticket Date', time(channel.createdAt ?? new Date(), 'R'))
			.setTimestamp();

		if (record.LogsChannel !== '0') {
			channelEmbed.setFooter({
				text: `Message logs are on, be cautious of what you say! Version ${version}`
			});
		} else {
			channelEmbed.setFooter({ text: `Version ${version}` });
		}

		embeds.push(channelEmbed);

		if (record.Notes) {
			embeds.push(
				new MessageEmbed().setColor('BLURPLE').setTitle('Notes').setDescription(record.Notes)
			);
		}

		const row = new MessageActionRow();

		if (channel.isThread()) {
			row.addComponents(
				new MessageButton()
					.setCustomId('button_ticket_archive')
					.setStyle('SUCCESS')
					.setEmoji('🔒')
					.setLabel('Archive')
			);
		}

		row.addComponents(
			new MessageButton()
				.setCustomId('button_ticket_delete')
				.setStyle('DANGER')
				.setEmoji('✖️')
				.setLabel('Delete')
		);

		const msg = await channel.send({
			embeds,
			components: [row],
			...((channel.isThread() || record.TextChannelPing) && {
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
			ephemeral: true
		});

		if (record.LogsChannel !== '0') {
			ticketEmbed.setDescription(
				`${userMention(interaction.user.id)} has created a ticket! View it at ${channelMention(
					channel.id
				)}`
			);

			const logsChannel = await interaction.guild!.channels.fetch(record.LogsChannel)!;

			if (!logsChannel?.isText()) return;
			if (!logsChannel.permissionsFor(interaction.guild!.me!).has(['SEND_MESSAGES'])) return;

			logsChannel.send({ embeds: [ticketEmbed] });
		}
	} catch (err) {
		console.error(err);
	}
};
