import { userMention } from '@discordjs/builders';
import {
	MessageEmbed,
	TextChannel,
	type CommandInteraction,
	type MessageComponentInteraction
} from 'discord.js';
import { version } from '../../package.json';
import type { Tables } from '../types';

export const handleTicketDelete = async (
	interaction: CommandInteraction | MessageComponentInteraction,
	record?: Tables.TicketingManagers
) => {
	try {
		// users on mobile can still interact with buttons and the archived thread isn't fetched on startup
		if (!interaction.channel) {
			return;
		}

		if (
			interaction.channel.isThread() &&
			interaction.channel.archived &&
			interaction.channel.unarchivable
		) {
			await interaction.channel.setArchived(false);
		}

		if (!interaction.channel.isThread() && !(interaction.channel instanceof TextChannel)) {
			return interaction.reply({
				content: 'You must use this command in a support ticket',
				ephemeral: true
			});
		}

		if (
			!interaction.guild!.me!.permissions.has([
				'MANAGE_THREADS',
				'SEND_MESSAGES_IN_THREADS',
				'READ_MESSAGE_HISTORY',
				'VIEW_CHANNEL'
			])
		) {
			return interaction.reply({
				content:
					'I need the manage threads, send messages in threads, read message history, and view channel permission to run this command',
				ephemeral: true
			});
		}

		if (!record || record.RoleID === '0') {
			return interaction.reply({
				content:
					'No ticketing config or available managers role could be found, cannot delete ticket',
				ephemeral: true
			});
		}

		let isValidTicket = false;
		const authorId = interaction.channel.name.split('-').at(-1)!;

		// we have to force fetch the member for threads because they can't be found in the cache
		const hasAuthorInName = interaction.channel.isThread()
			? await interaction.channel.members.fetch(authorId, { force: true }).catch(() => false)
			: interaction.channel.members.has(authorId);

		// messy code but it works
		if (hasAuthorInName) {
			if (record.UseTextChannels) {
				if (interaction.channel.parentId === record.SupportCategory) {
					isValidTicket = true;
				}
			} else {
				if (
					interaction.channel.parentId === record.SupportChannel ||
					(interaction.channel.parent!.name.toLowerCase() === 'support' &&
						record.SupportChannel === '0')
				) {
					isValidTicket = true;
				}
			}
		}

		if (isValidTicket) {
			const managers = await interaction.guild!.roles.fetch(record.RoleID);

			if (!managers?.members.has(interaction.user.id)) {
				return interaction.reply({
					content: 'You need to be a ticketing manager to delete this ticket',
					ephemeral: true
				});
			}

			const embed = new MessageEmbed()
				.setColor('RED')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle('Ticket Deleted')
				.setDescription(`${userMention(interaction.user.id)} deleted the support ticket`)
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			await interaction.reply({ embeds: [embed] });

			if (record.LogsChannel !== '0') {
				const logsChannel = await interaction.guild!.channels.fetch(record.LogsChannel);

				if (!logsChannel?.isText()) return;
				if (!logsChannel.permissionsFor(interaction.guild!.me!).has(['SEND_MESSAGES'])) return;

				embed.setDescription(`${userMention(interaction.user.id)} deleted a ticket`);
				embed.addField('Name of Ticket', interaction.channel.name);

				logsChannel.send({ embeds: [embed] });

				const member = interaction.guild!.members.resolve(authorId);

				if (member && !managers.members.has(member.id)) {
					embed.setDescription(
						`${userMention(interaction.user.id)} deleted your support ticket in ${
							interaction.guild!.name
						}`
					);

					member.send({ embeds: [embed] }).catch(() => false);
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
