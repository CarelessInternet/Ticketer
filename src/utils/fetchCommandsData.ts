import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { fetchCommands } from '.';
import type { Command } from '../types';

/**
 * Fetches the slash command builder data for each command and returns global commands array and owner commands array in an array
 */
export const fetchCommandsData = async () => {
	const commands = await fetchCommands();

	// add each command data into an array, owner only commands go into a seperate array
	const ownerGuildCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
	const globalCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

	for (const command of commands) {
		const data = command.data.toJSON();

		command.privateGuildAndOwnerOnly ? ownerGuildCommands.push(data) : globalCommands.push(data);
	}

	return [globalCommands, ownerGuildCommands];
};
