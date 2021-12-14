import { config } from 'dotenv';
import { greenBright, magenta } from 'chalk';
import { fetchCommands } from '../utils';

config();

(async () => {
	const commands = await fetchCommands();

	for (const [i, command] of commands.entries()) {
		if (!command.data?.name) {
			throw new SyntaxError(
				`Missing a name property for the command file: ${commands[i]}.ts`
			);
		}
		if (!command.category) {
			throw new SyntaxError(
				`Missing a category for the command: ${commands[i]}`
			);
		}
		if (!command.execute) {
			throw new SyntaxError(
				`Missing the execution function for the command: ${command.data.name} (${command.category})`
			);
		}

		console.log(
			`✅ ${magenta('(' + command.category + ')')} ${greenBright(
				command.data.name
			)}`
		);
	}

	process.exit(0);
})();
