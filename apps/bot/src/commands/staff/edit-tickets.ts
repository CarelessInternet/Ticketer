import { type APIApplicationCommandOptionChoice, ChannelType, PermissionFlagsBits } from 'discord.js';
import { Command } from '@ticketer/djs-framework';
import { ThreadTicketing } from '@/utils';
import { getTranslations } from '@/i18n';
import { ticketsThreads } from '@ticketer/database';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('edit-tickets')
		.setDescription('Edit thread tickets.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit the state of a thread ticket.')
				.addChannelOption((option) =>
					option
						.setName('ticket')
						.setDescription('The thread channel of the ticket.')
						.addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread),
				)
				.addStringOption((option) =>
					option
						.setName('state')
						.setDescription('The new state to apply to the ticket.')
						.setRequired(true)
						.setChoices(
							...ticketsThreads.state.enumValues.map(
								(state) =>
									({
										name: ThreadTicketing.ticketState(state),
										name_localizations: getTranslations(`tickets.threads.categories.ticketState.${state}`),
										value: state,
									}) satisfies APIApplicationCommandOptionChoice<string>,
							),
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('purge')
				.setDescription('Purge thread tickets that are not labelled active.')
				.addBooleanOption((option) =>
					option
						.setName('all')
						.setDescription('Purge all or one of the categories which have inactive tickets.')
						.setRequired(true),
				),
		);

	public execute({ interaction }: Command.Context<'chat'>) {
		switch (interaction.options.getSubcommand(true)) {
			// case 'edit': {
			// 	return this.editTicketState({ interaction });
			// }
			// case 'purge': {
			// 	return this.purgeTickets({ interaction });
			// }
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.member).setDescription('The subcommand could not be found.')],
					ephemeral: true,
				});
			}
		}
	}

	// TODO: add purge either all or allowed one at a time categories (boolean).
	// private async editTicketState({ interaction }: Command.Context<'chat'>) {
	// 	const channel = interaction.options.getChannel('ticket', true, [
	// 		ChannelType.PublicThread,
	// 		ChannelType.PrivateThread,
	// 	]);

	// 	const state = interaction.options.getString('state', true) as ThreadTicketing.TicketState;
	// }

	// private async purgeTickets({ interaction }: Command.Context<'chat'>) {
	// 	return;
	// }
}
