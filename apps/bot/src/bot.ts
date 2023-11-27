import { GatewayIntentBits, Options } from 'discord.js';
import { dirname, resolve } from 'node:path';
import { Client } from '@ticketer/djs-framework';
import { environment } from '@ticketer/env/bot';
import { fileURLToPath } from 'node:url';

// https://discordjs.guide/miscellaneous/cache-customization.html#cache-customization
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
	sweepers: {
		...Options.DefaultSweeperSettings,
		bans: {
			interval: 10 * 60,
			filter: () => () => true,
		},
	},
});

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const eventsFolder = resolve(currentDirectory, './events');
const commandsFolder = resolve(currentDirectory, './commands');

await client.init(eventsFolder, commandsFolder);

client.login(environment.DISCORD_BOT_TOKEN);
