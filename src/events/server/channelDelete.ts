import { GuildChannel } from 'discord.js';
import { RowDataPacket } from 'mysql2';
import { conn } from '../../utils';
import { Handler, Tables } from '../../types';

export const execute: Handler['execute'] = async (
	_client,
	channel: GuildChannel
) => {
	try {
		const [rows1] = await conn.execute(
			'SELECT * FROM GuildMemberEvent WHERE GuildID = ?',
			[channel.guildId]
		);
		const [rows2] = await conn.execute(
			'SELECT * FROM TicketingManagers WHERE GuildID = ?',
			[channel.guildId]
		);

		const eventsRecord = (
			rows1 as RowDataPacket[]
		)[0] as Tables.GuildMemberEvent | null;
		const managersRecord = (
			rows2 as RowDataPacket[]
		)[0] as Tables.TicketingManagers | null;

		if (eventsRecord) {
			if (eventsRecord.ChannelID === channel.id) {
				conn.execute(
					'UPDATE GuildMemberEvent SET ChannelID = 0 WHERE GuildID = ?',
					[channel.guildId]
				);
			}
		}

		if (managersRecord) {
			if (managersRecord.SupportChannel === channel.id) {
				conn.execute(
					'UPDATE TicketingManagers SET SupportChannel = 0 WHERE GuildID = ?',
					[channel.guildId]
				);
			}
			if (managersRecord.LogsChannel === channel.id) {
				conn.execute(
					'UPDATE TicketingManagers SET LogsChannel = 0 WHERE GuildID = ?',
					[channel.guildId]
				);
			}
			if (managersRecord.SupportCategory === channel.id) {
				conn.execute(
					'UPDATE TicketingManagers SET SupportCategory = 0 WHERE GuildID = ?',
					[channel.guildId]
				);
			}
		}
	} catch (err) {
		console.error(err);
	}
};
