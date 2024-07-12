import { ShardingManager } from 'discord.js';
import chalk from 'chalk';
import { environment } from '@ticketer/env/bot';
import { fileURLToPath } from 'node:url';
import { formatDateLong } from '@/utils';
import path from 'node:path';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const botFilePath = path.resolve(currentDirectory, './bot.ts');

const sharder = new ShardingManager(botFilePath, {
	execArgv: ['--import=tsx'],
	mode: 'process',
	token: environment.DISCORD_BOT_TOKEN,
});

sharder.on('shardCreate', (shard) => {
	console.log(
		chalk.green('[Sharding]'),
		'Created',
		chalk.yellow(`shard #${shard.id.toString()}`),
		`on ${formatDateLong()}.`,
	);
	shard.once('ready', () => {
		console.log(chalk.yellow(`[Shard #${shard.id.toString()}]`), 'This shard has become ready.');
	});
});

console.log(chalk.green('[Sharding]'), `Starting the sharding manager on ${formatDateLong()}.`);

void sharder.spawn();
