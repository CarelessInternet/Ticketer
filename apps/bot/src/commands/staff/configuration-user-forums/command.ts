import { Command } from '@ticketer/djs-framework';
import { ChannelType, PermissionFlagsBits } from 'discord.js';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('configuration-user-forums')
		.setDescription('Edit the configuration for when a thread is created in a forum by a member.')
		.setDefaultMemberPermissions(
			PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads,
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('overview').setDescription('View the current configurations for user forum threads.'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a new configuration for user forums assisted by the bot.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The forum channel where the bot assists with support for the user.')
						.addChannelTypes(ChannelType.GuildForum)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit a specified user forums configuration.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel to edit the configuration from.')
						.addChannelTypes(ChannelType.GuildForum)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete a user forum configuration.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel to delete the configuration from.')
						.addChannelTypes(ChannelType.GuildForum)
						.setRequired(true),
				),
		);

	public execute: undefined;
}
