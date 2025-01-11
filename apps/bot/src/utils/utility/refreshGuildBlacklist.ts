import { database, guildBlacklists } from '@ticketer/database';
import type { Client } from '@ticketer/djs-framework';

export async function refreshGuildBlacklist(client: Client) {
	const blacklists = await database.select().from(guildBlacklists);
	client.guildBlacklists.clear();

	for (const blacklist of blacklists) {
		client.guildBlacklists.set(blacklist.guildId, blacklist);
	}
}
