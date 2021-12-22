import { Collection, MessageEmbed, Snowflake, ThreadMember } from 'discord.js';
import { channelMention, memberNicknameMention } from '@discordjs/builders';
import { RowDataPacket } from 'mysql2';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import { Handler, Tables } from '../../types';

export const execute: Handler['execute'] = async (
	client,
	members: Collection<Snowflake, ThreadMember>
) => {
	try {
		const first = members.first()!;
		const { thread } = first;
		const { name, id } = first.thread;

		const ticketUserId = name.split('-').at(-1)!;
		const member = members.get(ticketUserId);

		if (!member) return;

		if (name === `ticket-${ticketUserId}`) {
			if (
				thread.members.cache.has(client.user!.id) &&
				!thread.members.cache.has(ticketUserId)
			) {
				const [rows] = await conn.execute(
					'SELECT * FROM TicketingManagers WHERE GuildID = ?',
					[thread.guildId]
				);
				const record = (
					rows as RowDataPacket[]
				)[0] as Tables.TicketingManagers | null;

				if (!record) return;

				const user = member.user!;
				const embed = new MessageEmbed()
					.setColor('YELLOW')
					.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
					.setTitle('Ticket Archived')
					.setDescription(
						`${memberNicknameMention(user.id)} left the support ticket!`
					)
					.setTimestamp()
					.setFooter(`Version ${version}`);

				await thread.send({ embeds: [embed] });
				await thread.setArchived(true);

				if (record.LogsChannel !== '0') {
					embed.setDescription(
						`${memberNicknameMention(
							user.id
						)} left their ticket! View it at ${channelMention(id)}`
					);
					embed.addField('Name of Ticket', name);

					const logsChannel = await thread.guild.channels.fetch(
						record.LogsChannel
					);

					if (!logsChannel?.isText()) return;
					if (
						!logsChannel.permissionsFor(thread.guild.me!).has(['SEND_MESSAGES'])
					)
						return;

					logsChannel.send({ embeds: [embed] });
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
};
