import { Constants, Intents } from 'discord.js';
import { PresenceUpdateStatus } from 'discord-api-types/v9';
import { Client, type Handler } from './types';

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS
	],
	partials: [Constants.PartialTypes.MESSAGE, Constants.PartialTypes.REACTION],
	shards: 'auto',
	presence: {
		activities: [{ name: '🎳 | /help', type: Constants.ActivityTypes.COMPETING }],
		status: PresenceUpdateStatus.Online
	}
});

['commands', 'events'].forEach(async (handler) => {
	const { default: file }: { default: Handler } = await import(`./handlers/${handler}`);
	file(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
