import { Intents } from 'discord.js';
import { Client, Handler } from './types';

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_BANS
	],
	shards: 'auto'
});

['commands', 'events'].forEach(async (handler) => {
	const file: Handler = await import(`./handlers/${handler}`);
	file.execute(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
