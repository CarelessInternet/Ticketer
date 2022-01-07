import { fetchCommands } from '../utils';
import type { Handler } from '../types';

const execute: Handler = async (client) => {
	const commands = await fetchCommands();

	for (const command of commands) {
		client.commands.set(command.data.name, command);
	}
};

export default execute;
