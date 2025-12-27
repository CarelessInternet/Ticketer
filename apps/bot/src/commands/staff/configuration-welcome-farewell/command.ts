import { Command } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('configuration-welcome-farewell')
		.setDescription('Edit the configuration for welcome and farewell messages.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels)
		.addSubcommand((subcommand) =>
			subcommand.setName('settings').setDescription('Edit the settings of welcome and farewell messages.'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('overview')
				.setDescription('View the current configuration for welcome and farewell messages.'),
		);

	public execute: undefined;
}
