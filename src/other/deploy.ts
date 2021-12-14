import { config } from 'dotenv';
import { green, red } from 'chalk';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import { fetchCommandsData } from '../utils';

config();

const [token, clientId, guildId] = [
	process.env.DISCORD_BOT_TOKEN,
	process.env.DISCORD_CLIENT_ID,
	process.env.DISCORD_GUILD_ID
];
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log(green('Started refreshing applicaton (/) commands'));

		const [globalCommands, ownerGuildCommands] = await fetchCommandsData();

		await rest.put(Routes.applicationCommands(clientId), {
			body: globalCommands
		});

		if (ownerGuildCommands.length) {
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
				body: ownerGuildCommands
			});
		}

		console.log(green('Successfully reloaded application (/) commands'));
		process.exit(0);
	} catch (err) {
		console.error(red(err));
	}
})();
