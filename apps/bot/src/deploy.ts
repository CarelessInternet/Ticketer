import { Client } from '@ticketer/djs-framework';
import chalk from 'chalk';
import { environment } from '@ticketer/env/bot';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';

const client = new Client({
	intents: [],
});

await client.init(
	fileURLToPath(new URL('events', import.meta.url)),
	fileURLToPath(new URL('commands', import.meta.url)),
);

await client.deploy({
	token: environment.DISCORD_BOT_TOKEN,
	applicationId: environment.DISCORD_APPLICATION_ID,
	guildId: environment.DISCORD_GUILD_ID,
});

console.log(chalk.magenta('[Deployment]'), 'Successfully refreshed the application commands!');

exit(0);
