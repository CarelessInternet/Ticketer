import fg from 'fast-glob';
import { resolve } from 'path';
import type { Event, Handler } from '../types';

const execute: Handler = async (client) => {
	const files = await fg(resolve(__dirname, '../events/**/*.js'));

	for (const file of files) {
		const { default: event }: { default: Event } = await import(file);
		client.on(event.name, event.execute.bind(null, client));
	}
};

export default execute;
