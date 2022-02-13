import type { RowDataPacket } from 'mysql2';
import { Constants, type GuildMember, MessageEmbed } from 'discord.js';
import { memberNicknameMention, time } from '@discordjs/builders';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Event, Tables } from '../../types';

const event: Event = {
	name: Constants.Events.GUILD_MEMBER_REMOVE,
	execute: async (_client, member: GuildMember) => {
		try {
			const [rows] = await conn.execute('SELECT * FROM GuildMemberEvent WHERE GuildID = ?', [
				member.guild.id
			]);
			const record = (rows as RowDataPacket[])[0] as Tables.GuildMemberEvent | null;

			if (!record) return;

			const { ChannelID, Enabled } = record;
			if (Enabled && ChannelID !== '0') {
				const channel = await member.guild.channels.fetch(ChannelID);

				if (!channel?.permissionsFor(member.guild.me!).has(['SEND_MESSAGES'])) return;
				if (!channel.isText()) return;

				const embed = new MessageEmbed()
					.setColor('RED')
					.setTitle(`Bye ${member.user.tag}!`)
					.setDescription(`${memberNicknameMention(member.id)} has left the server.`)
					.addField('Account Creation Date', time(member.user.createdAt, 'R'), true)
					.addField('Leave Date', time(new Date(), 'R'), true)
					.setThumbnail(member.displayAvatarURL({ dynamic: true }))
					.setTimestamp()
					.setFooter({ text: `Version ${version}` });

				channel.send({ embeds: [embed] });
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default event;
