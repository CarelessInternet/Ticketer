import { Command } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('configuration-ticket-threads')
		.setDescription('Edit the configuration for tickets that use threads.')
		.setDefaultMemberPermissions(
			PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads,
		)
		.addSubcommandGroup((group) =>
			group
				.setName('global-settings')
				.setDescription('Edit the global settings of thread tickets.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('active-tickets')
						.setDescription('Change the amount of active tickets a user may have at once.')
						.addIntegerOption((option) =>
							option
								.setName('amount')
								.setDescription('The amount of active tickets at once.')
								.setRequired(true)
								.setMinValue(1)
								.setMaxValue(255),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand.setName('overview').setDescription('View the current global configuration of thread tickets.'),
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName('categories')
				.setDescription('The configuration for categories used in thread tickets.')
				.addSubcommand((subcommand) =>
					subcommand.setName('view').setDescription('View the current categories for thread tickets.'),
				)
				.addSubcommand((subcommand) =>
					subcommand.setName('create').setDescription('Create a category for thread tickets.'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('edit')
						.setDescription('Edit a category for thread tickets.')
						.addStringOption((option) =>
							option
								.setName('title')
								.setDescription('The title of the category of which you want to edit.')
								.setAutocomplete(true)
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('delete')
						.setDescription('Delete a category from thread tickets.')
						.addStringOption((option) =>
							option
								.setName('title')
								.setDescription('The title of the category of which you want to delete.')
								.setAutocomplete(true)
								.setRequired(true),
						),
				),
		);

	public execute: undefined;
}
