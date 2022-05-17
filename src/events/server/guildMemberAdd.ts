import type { RowDataPacket } from 'mysql2';
import { Constants, type GuildMember, MessageEmbed } from 'discord.js';
import { userMention, time } from '@discordjs/builders';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Event, Tables } from '../../types';

const event: Event = {
	name: Constants.Events.GUILD_MEMBER_ADD,
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
					.setColor('DARK_GREEN')
					.setTitle(`Welcome ${member.user.tag}!`)
					.setDescription(
						`${userMention(member.id)} Thanks for joining ${member.guild.name}! Enjoy it here!`
					)
					.addField('Account Creation Date', time(member.user.createdAt, 'R'), true)
					.addField('Join Date', time(new Date(), 'R'), true)
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
