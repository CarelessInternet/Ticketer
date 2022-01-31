import { channelMention, memberNicknameMention } from '@discordjs/builders';
import {
	MessageEmbed,
	type CommandInteraction,
	type MessageComponentInteraction
} from 'discord.js';
import { version } from '../../package.json';
import type { Tables } from '../types';

export const handleTicketArchive = async (
	interaction: CommandInteraction | MessageComponentInteraction,
	record?: Tables.TicketingManagers
) => {
	try {
		if (!interaction.channel?.isThread()) {
			return;
		}

		if (
			!interaction.guild!.me!.permissions.has([
				'MANAGE_THREADS',
				'SEND_MESSAGES_IN_THREADS'
			])
		) {
			return interaction.reply({
				content:
					'I need the manage threads and send messages in threads permission to run this command',
				ephemeral: true
			});
		}

		if (!record || record.RoleID === '0') {
			return interaction.reply({
				content:
					'No ticketing config or available managers role could be found, cannot archive ticket',
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
						'You may not archive this thread, you are not the original author nor a manager',
					ephemeral: true
				});
			}

			const embed = new MessageEmbed()
				.setColor('YELLOW')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle('Ticket Archived')
				.setDescription(
					`${memberNicknameMention(
						interaction.user.id
					)} archived the support ticket`
				)
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			await interaction.reply({ embeds: [embed] });
			interaction.channel!.setArchived(true);

			if (record.LogsChannel !== '0') {
				embed.setDescription(
					`${memberNicknameMention(
						interaction.user.id
					)} archived a ticket! View it at ${channelMention(
						interaction.channelId
					)}`
				);
				embed.addField('Name of Ticket', interaction.channel.name);

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

				logsChannel.send({ embeds: [embed] });
			}
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
