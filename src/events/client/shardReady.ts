import { blue } from 'chalk';
import { Constants } from 'discord.js';
import type { Event } from '../../types';

const event: Event = {
	name: Constants.Events.SHARD_READY,
	execute: (client, id: number) => {
		console.log(
			`${blue('[Shard ' + id + ']')} Logged in as ${
				client.user!.tag
			} at ${new Date().toLocaleString()}`
		);
	}
};

export default event;
