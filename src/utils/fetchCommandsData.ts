import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { fetchCommands } from '.';

/**
 * Fetches the slash command builder data for each command and returns global commands array and owner commands array in an array
 */
export const fetchCommandsData = async () => {
	const commands = await fetchCommands();

	// add each command data into an array, owner only commands go into a seperate array
	const [ownerGuildCommands, globalCommands]: RESTPostAPIApplicationCommandsJSONBody[][] = [[], []];

	for (const command of commands) {
		const data = command.data.toJSON();

		if (command.privateGuildAndOwnerOnly) {
			ownerGuildCommands.push(data);
		} else {
			globalCommands.push(data);
		}
	}

	return [globalCommands, ownerGuildCommands];
};
