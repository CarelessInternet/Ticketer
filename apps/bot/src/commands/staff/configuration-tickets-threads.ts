import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('configuration-tickets-threads')
		.setDescription('Edit the configuration for tickets that use threads.')
		.setDefaultMemberPermissions(
			PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads,
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('settings').setDescription('Edit the settings of thread tickets.'),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('overview').setDescription('View the current configuration for thread tickets.'),
		);

	@DeferReply(false)
	public async execute({ interaction }: Command.Context) {
		return interaction.editReply({ content: 'hi' });
	}
}
