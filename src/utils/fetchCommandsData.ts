import fg from 'fast-glob';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { resolve } from 'path';
import type { Command } from '../types';

/**
 * Fetches the slash command builder data for each command and returns global commands array and owner commands array in an array
 */
export const fetchCommandsData = async () => {
	const files = await fg(resolve(__dirname, '../commands/**/*.js'));

	// add each command data into an array, owner only commands go into a seperate array
	const ownerGuildCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
	const globalCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

	for await (const file of files) {
		const { default: command }: { default: Command } = await import(file);
		const data = command.data.toJSON();

		command.privateGuildAndOwnerOnly ? ownerGuildCommands.push(data) : globalCommands.push(data);
	}

	return [globalCommands, ownerGuildCommands];
};
