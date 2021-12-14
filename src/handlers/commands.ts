import { fetchCommands } from '../utils';
import { Handler } from '../types';

export const execute: Handler['execute'] = async (client) => {
	const commands = await fetchCommands();

	for (const command of commands) {
		client.commands.set(command.data.name, command);
	}
};
