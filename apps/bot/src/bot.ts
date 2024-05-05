import { GatewayIntentBits, Options } from 'discord.js';
import { Client } from '@ticketer/djs-framework';
import { environment } from '@ticketer/env/bot';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const interval = 60;
const filter = () => () => true;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
	sweepers: {
		...Options.DefaultSweeperSettings,
		// Periodically sweep the caches we do not need.
		autoModerationRules: { filter, interval },
		bans: { filter, interval },
		invites: { filter, interval },
		presences: { filter, interval },
		reactions: { filter, interval },
		stageInstances: { filter, interval },
		stickers: { filter, interval },
		voiceStates: { filter, interval },
	},
});

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const eventsFolder = path.resolve(currentDirectory, './events');
const commandsFolder = path.resolve(currentDirectory, './commands');

await client.init(eventsFolder, commandsFolder);

void client.login(environment.DISCORD_BOT_TOKEN);
