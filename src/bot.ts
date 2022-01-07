import { Intents } from 'discord.js';
import { Client, type Handler } from './types';

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.DIRECT_MESSAGES
	],
	shards: 'auto'
});

['commands', 'events'].forEach(async (handler) => {
	const { default: file }: { default: Handler } = await import(
		`./handlers/${handler}`
	);
	file(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
