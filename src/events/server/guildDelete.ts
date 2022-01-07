import { Constants, type Guild } from 'discord.js';
import { conn } from '../../utils';
import type { Event } from '../../types';

const event: Event = {
	name: Constants.Events.GUILD_DELETE,
	execute: async (_client, guild: Guild) => {
		try {
			conn.execute('DELETE FROM TicketingManagers WHERE GuildID = ?', [
				guild.id
			]);
			conn.execute('DELETE FROM GuildMemberEvent WHERE GuildID = ?', [
				guild.id
			]);
			conn.execute('DELETE FROM Suggestions WHERE GuildID = ?', [guild.id]);
		} catch (err) {
			console.error(err);
		}
	}
};

export default event;
