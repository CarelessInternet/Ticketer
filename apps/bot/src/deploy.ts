import { Client } from '@ticketer/djs-framework';
import chalk from 'chalk';
import { environment } from '@ticketer/env/bot';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const client = new Client({
	intents: [],
});

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const eventsFolder = path.resolve(currentDirectory, './events');
const commandsFolder = path.resolve(currentDirectory, './commands');

await client.init(eventsFolder, commandsFolder);

await client.deploy({
	token: environment.DISCORD_BOT_TOKEN,
	applicationId: environment.DISCORD_APPLICATION_ID,
	guildId: environment.DISCORD_GUILD_ID,
});

console.log(chalk.magenta('[Deployment]'), 'Successfully refreshed the application commands!');

exit(0);
