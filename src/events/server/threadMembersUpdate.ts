import type { RowDataPacket } from 'mysql2';
import {
	Constants,
	type Collection,
	MessageEmbed,
	type Snowflake,
	type ThreadMember
} from 'discord.js';
import { channelMention, userMention } from '@discordjs/builders';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Event, Tables } from '../../types';

const event: Event = {
	name: Constants.Events.THREAD_MEMBERS_UPDATE,
	execute: async (client, members: Collection<Snowflake, ThreadMember>) => {
		try {
			const first = members.first();

			if (!first) return;

			const { thread } = first;
			const { name, id } = first.thread;

			const ticketUserId = name.split('-').at(-1)!;
			const member = members.get(ticketUserId);

			if (!member) return;

			if (name === `ticket-${ticketUserId}`) {
				if (thread.members.cache.has(client.user!.id) && !thread.members.cache.has(ticketUserId)) {
					const [rows] = await conn.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [
						thread.guildId
					]);
					const record = (rows as RowDataPacket[])[0] as Tables.TicketingManagers | null;

					if (!record) return;

					const user = member.user!;
					const embed = new MessageEmbed()
						.setColor('YELLOW')
						.setAuthor({
							name: user.tag,
							iconURL: user.displayAvatarURL({ dynamic: true })
						})
						.setTitle('Ticket Archived')
						.setDescription(`${userMention(user.id)} left the support ticket!`)
						.setTimestamp()
						.setFooter({ text: `Version ${version}` });

					await thread.send({ embeds: [embed] });
					await thread.setArchived(true);

					if (record.LogsChannel !== '0') {
						embed.setDescription(
							`${userMention(user.id)} left their ticket! View it at ${channelMention(id)}`
						);
						embed.addField('Name of Ticket', name);

						const logsChannel = await thread.guild.channels.fetch(record.LogsChannel);

						if (!logsChannel?.isText()) return;
						if (!logsChannel.permissionsFor(thread.guild.me!).has(['SEND_MESSAGES'])) return;

						logsChannel.send({ embeds: [embed] });
					}
				}
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default event;
