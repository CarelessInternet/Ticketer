import fg from 'fast-glob';
import { resolve } from 'path';
import type { Command } from '../types';

/**
 * Returns a list of all commands
 */
export const fetchCommands = async (): Promise<Command[]> => {
	const files = await fg(resolve(__dirname, '../commands/**/*.js'));
	const commands: Command[] = [];

	for (const file of files) {
		const { default: command }: { default: Command } = await import(file);
		commands.push(command);
	}

	return commands;
};
