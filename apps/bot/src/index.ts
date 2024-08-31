import { ShardingManager } from 'discord.js';
import chalk from 'chalk';
import { environment } from '@ticketer/env/bot';
import { fileURLToPath } from 'node:url';
import { formatDateLong } from '@/utils';

const sharder = new ShardingManager(fileURLToPath(import.meta.resolve('./bot.ts')), {
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
		console.log(chalk.yellow(`[Shard #${shard.id.toString()}]`), `This shard has become ready on ${formatDateLong()}.`);
	});
});

console.log(chalk.green('[Sharding]'), `Starting the sharding manager on ${formatDateLong()}.`);

void sharder.spawn();
