import { ticketsThreads } from '@ticketer/database';
import { Command } from '@ticketer/djs-framework';
import { type APIApplicationCommandOptionChoice, ChannelType, PermissionFlagsBits } from 'discord.js';
import { getTranslations } from '@/i18n';
import { ThreadTicketing } from '@/utils';

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
						.addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread)
						.setRequired(true),
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
				.setDescription('Purge thread tickets in selected categories that are not an active thread.')
				.addBooleanOption((option) =>
					option
						.setName('state-source')
						.setDescription("Purge by the thread state in Discord (true) or the bot's saved state (false).")
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			// No boolean option for the state source as fetching the archived threads per channel can lead to API spam.
			subcommand
				.setName('prune')
				.setDescription('Prune thread tickets in selected categories that have a specified state saved by the bot.')
				.addStringOption((option) =>
					option
						.setName('state')
						.setDescription('The state of tickets to prune.')
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
		);

	public execute: undefined;
}
