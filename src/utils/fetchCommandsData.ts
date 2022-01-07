import fg from 'fast-glob';
import type { RESTPatchAPIApplicationCommandJSONBody } from 'discord-api-types/v9';
import { resolve } from 'path';
import type { Command } from '../types';

/**
 * Fetches the slash command builder data for each command and returns global commands array and owner commands array in an array
 */
export const fetchCommandsData = async (): Promise<
	RESTPatchAPIApplicationCommandJSONBody[][]
> => {
	const files = await fg(resolve(__dirname, '../commands/**/*.js'));

	// add each command data into an array, owner only commands go into a seperate array
	const ownerGuildCommands: RESTPatchAPIApplicationCommandJSONBody[] = [];
	const globalCommands = await files.reduce(
		async (
			acc: Promise<RESTPatchAPIApplicationCommandJSONBody[]>,
			file: string
		) => {
			const accumulator = await acc;
			const { default: command }: { default: Command } = await import(file);
			const data = command.data.toJSON();

			command.privateGuildAndOwnerOnly
				? ownerGuildCommands.push(data)
				: accumulator.push(data);
			return acc;
		},
		Promise.resolve([])
	);

	return [globalCommands, ownerGuildCommands];
};
