import fg from 'fast-glob';
import { resolve } from 'path';
import { Handler } from '../types';

export const execute: Handler['execute'] = async (client) => {
	const files = await fg(resolve(__dirname, '../events/**/*.js'));

	for (const file of files) {
		const event: Handler = await import(file);
		const name = file.split('.')[0].split('/').at(-1)!;

		client.on(name, event.execute.bind(null, client));
	}
};
