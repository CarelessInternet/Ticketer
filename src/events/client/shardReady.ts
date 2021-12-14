import { blue } from 'chalk';
import { Handler } from '../../types';

export const execute: Handler['execute'] = (client, id: number) => {
	client.user!.setActivity('⛳ | /help', { type: 'COMPETING' });
	console.log(`${blue('[Shard ' + id + ']')} Logged in as ${client.user!.tag}`);
};
