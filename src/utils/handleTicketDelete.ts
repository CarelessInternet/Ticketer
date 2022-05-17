import { userMention } from '@discordjs/builders';
import {
	MessageAttachment,
	MessageEmbed,
	type Snowflake,
	TextChannel,
	type ThreadChannel,
	type CommandInteraction,
	type MessageComponentInteraction,
	type Message
} from 'discord.js';
import { version } from '../../package.json';
import type { Tables } from '../types';

export const handleTicketDelete = async (
	interaction: CommandInteraction | MessageComponentInteraction,
	record?: Tables.TicketingManagers
) => {
	try {
		if (!interaction.channel!.isThread() && !(interaction.channel instanceof TextChannel)) {
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
			? await interaction.channel.members.fetch(authorId, { force: true }).catch(() => false)
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

				const allMessages = await fetchMessages(interaction.channel);
				const messages = allMessages.map((msg) => {
					if (msg.author.id !== interaction.client.user!.id) {
						return `${msg.author.tag}: ${msg.content}\n`;
					}
				});

				const firstMessage = allMessages[0];
				const subject =
					firstMessage?.author.id === interaction.client.user!.id
						? firstMessage.embeds?.[0]?.fields?.[0]?.value
						: 'Unknown';

				const content = `Subject: ${subject}\n\n` + messages.join('');
				const attachment = new MessageAttachment(
					Buffer.from(content, 'utf8'),
					`Ticketer-${Date.now()}.txt`
				);

				embed.setDescription(`${userMention(interaction.user.id)} deleted a ticket`);
				embed.addField('Name of Ticket', interaction.channel.name);
				embed.addField(
					'Message History',
					'The message history can be found in the attachment above'
				);

				logsChannel.send({ embeds: [embed], files: [attachment] });

				const user = interaction.guild!.members.resolve(authorId);

				if (user && !managers.members.has(user.id)) {
					embed.setDescription(
						`${userMention(interaction.user.id)} deleted your support ticket in ${
							interaction.guild!.name
						}`
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

const fetchMessages = async (
	channel: TextChannel | ThreadChannel,
	messages: Message[] = [],
	messageId?: Snowflake
): Promise<Message[]> => {
	// limit is 100: https://discord.com/developers/docs/resources/channel#get-channel-messages
	const limit = 100;

	const fetchedMessages = await channel.messages.fetch(
		{
			limit,
			...(messageId && { before: messageId })
		},
		{ cache: false, force: true }
	);
	const allMessages = [...messages, ...fetchedMessages.map((msg) => msg)];

	// don't fetch more than 1000 messages for rate limit reasons
	if (fetchedMessages.size === limit && messages.length < 1_000 - limit) {
		return fetchMessages(channel, allMessages, fetchedMessages.lastKey());
	}

	return allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
};
