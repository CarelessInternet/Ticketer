import { red } from 'chalk';
import { Constants } from 'discord.js';
import type { Event } from '../../types';

const event: Event = {
	name: Constants.Events.SHARD_ERROR,
	execute: (_client, error: Error, id: number) => {
		console.error(red(`[Shard ${id} at ${new Date().toLocaleString()}]`), error);
	}
};

export default event;
