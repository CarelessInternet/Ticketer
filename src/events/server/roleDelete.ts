import type { RowDataPacket } from 'mysql2';
import { Constants, type Role } from 'discord.js';
import { conn } from '../../utils';
import type { Event, Tables } from '../../types';

const event: Event = {
	name: Constants.Events.GUILD_ROLE_DELETE,
	execute: async (_client, role: Role) => {
		try {
			const [rows] = await conn.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [
				role.guild.id
			]);
			const record = (rows as RowDataPacket[])[0] as Tables.TicketingManagers | null;

			if (!record) return;

			const { RoleID } = record;
			if (RoleID !== role.id) return;

			conn.execute('UPDATE TicketingManagers SET RoleID = 0 WHERE GuildID = ?', [role.guild.id]);
		} catch (err) {
			console.error(err);
		}
	}
};

export default event;
