import { dirname, resolve } from 'node:path';
import { ShardingManager } from 'discord.js';
import chalk from 'chalk';
import { environment } from '@ticketer/env/bot';
import { fileURLToPath } from 'node:url';
import { formatDate } from '@/utils';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const botFilePath = resolve(currentDirectory, './bot.ts');

// https://github.com/esbuild-kit/tsx/issues/354
const sharder = new ShardingManager(botFilePath, {
	// Using child_process instead of worker mode results in ERR_UNKNOWN_FILE_EXTENSION.
	mode: 'worker',
	token: environment.DISCORD_BOT_TOKEN,
});

sharder.on('shardCreate', (shard) => {
	console.log(chalk.green('[Sharding]'), `Created shard #${shard.id} at ${formatDate(new Date())}.`);
	shard.once('ready', () => console.log(chalk.yellow(`[Shard #${shard.id}]`), 'This shard has become ready.'));
});

sharder.spawn();
