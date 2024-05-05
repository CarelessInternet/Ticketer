import { ShardingManager } from 'discord.js';
import chalk from 'chalk';
import { environment } from '@ticketer/env/bot';
import { fileURLToPath } from 'node:url';
import { formatDateLong } from '@/utils';
import path from 'node:path';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const botFilePath = path.resolve(currentDirectory, './bot.ts');

// https://github.com/esbuild-kit/tsx/issues/354
const sharder = new ShardingManager(botFilePath, {
	// Using child_process instead of worker mode results in ERR_UNKNOWN_FILE_EXTENSION.
	mode: 'worker',
	token: environment.DISCORD_BOT_TOKEN,
});

sharder.on('shardCreate', (shard) => {
	console.log(
		chalk.green('[Sharding]'),
		'Created',
		chalk.yellow(`shard #${shard.id.toString()}`),
		`on ${formatDateLong(new Date())}.`,
	);
	shard.once('ready', () => {
		console.log(chalk.yellow(`[Shard #${shard.id.toString()}]`), 'This shard has become ready.');
	});
});

void sharder.spawn();
