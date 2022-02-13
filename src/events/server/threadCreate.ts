import type { RowDataPacket } from 'mysql2';
import { Constants, type ThreadChannel } from 'discord.js';
import { conn } from '../../utils';
import type { Event, Tables } from '../../types';

const event: Event = {
	name: Constants.Events.THREAD_CREATE,
	execute: async (client, thread: ThreadChannel) => {
		try {
			const { guild, guildId } = thread;
			const { id: parentId, lastMessage, name } = thread.parent!;

			const [rows] = await conn.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [
				guildId
			]);
			const record = (rows as RowDataPacket[])[0] as Tables.TicketingManagers | null;

			if (
				thread.permissionsFor(guild.me!).has(['MANAGE_MESSAGES']) &&
				lastMessage?.system &&
				lastMessage.author.id === client.user!.id
			) {
				if ((record && record.SupportChannel === parentId) || name.toLowerCase() === 'support') {
					lastMessage.delete();
				}
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default event;
