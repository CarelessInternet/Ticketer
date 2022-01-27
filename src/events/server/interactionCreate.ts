import {
	Constants,
	type MessageInteraction,
	type Interaction
} from 'discord.js';
import type { Event } from '../../types';

const event: Event = {
	name: Constants.Events.INTERACTION_CREATE,
	execute: (client, interaction: Interaction) => {
		if (interaction.isCommand() || interaction.isButton()) {
			if (!interaction.inGuild()) {
				return interaction.reply({
					content: 'You need to be in a server to use my commands',
					ephemeral: true
				});
			}

			const cmd = interaction.isCommand()
				? interaction.commandName
				: (interaction.message.interaction as MessageInteraction).commandName;
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

			if (interaction.isCommand()) {
				command.execute({ client, interaction });
			} else {
				command.buttonExecute?.({ client, interaction });
			}
		} else {
			return;
		}
	}
};

export default event;
