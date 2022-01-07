import { Constants, type Interaction } from 'discord.js';
import type { Event } from '../../types';

const event: Event = {
	name: Constants.Events.INTERACTION_CREATE,
	execute: (client, interaction: Interaction) => {
		if (!interaction.isCommand()) return;
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'You need to be in a server to use my commands',
				ephemeral: true
			});
		}

		const cmd = interaction.commandName;
		const command = client.commands.get(cmd);

		if (!command) return;

		if (
			(command.ownerOnly || command.privateGuildAndOwnerOnly) &&
			interaction.user.id !== process.env.DISCORD_OWNER_ID
		) {
			return interaction.reply({
				content: 'You need to be the owner of the bot to run this command',
				ephemeral: true
			});
		}

		command.execute({ client, interaction });
	}
};

export default event;
