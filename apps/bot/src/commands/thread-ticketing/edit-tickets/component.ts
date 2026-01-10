import {
	and,
	database,
	eq,
	inArray,
	ne,
	notInArray,
	ticketsThreads,
	ticketThreadsCategories,
} from '@ticketer/database';
import { Component, customId, DeferUpdate, dynamicCustomId, extractCustomId, userEmbed } from '@ticketer/djs-framework';
import { inlineCode } from 'discord.js';
import { ThreadTicketing } from '@/utils';

export default class extends Component.Interaction {
	public readonly customIds = [
		customId('ticket_threads_categories_edit_tickets_purge_prune_menu'),
		dynamicCustomId('ticket_threads_categories_edit_tickets_purge_prune_menu'),
	];

	@DeferUpdate
	public async execute({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const [stateInDiscord, rawState] = dynamicValue.split('_');
		const state = rawState as ThreadTicketing.TicketState | null;
		const categoryIds = interaction.values.map(Number);

		// Prune subcommand.
		if (state) {
			const whereQuery = and(
				eq(ticketsThreads.guildId, interaction.guildId),
				inArray(ticketsThreads.categoryId, categoryIds),
				eq(ticketsThreads.state, state),
			);

			const categories = await database
				.select({
					categoryEmoji: ticketThreadsCategories.categoryEmoji,
					categoryTitle: ticketThreadsCategories.categoryTitle,
					count: database.$count(ticketsThreads, whereQuery),
				})
				.from(ticketThreadsCategories)
				.where(
					and(
						eq(ticketThreadsCategories.guildId, interaction.guildId),
						inArray(ticketThreadsCategories.id, categoryIds),
					),
				);

			await database.delete(ticketsThreads).where(whereQuery);
			await interaction.followUp({
				embeds: [
					userEmbed(interaction)
						.setTitle('Pruned Thread Tickets')
						.setDescription(
							`${interaction.member} pruned ${categories.at(0)?.count.toString() ?? 'Unknown'} ` +
								`ticket(s) with the state ${inlineCode(ThreadTicketing.ticketState(state))} in the following categories:
							${categories.map((category) => ThreadTicketing.titleAndEmoji(category.categoryTitle, category.categoryEmoji)).join(', ')}.`,
						),
				],
			});

			return interaction.deleteReply();
		} else {
			// Purge subcommand.
			const whereQueries = [
				eq(ticketsThreads.guildId, interaction.guildId),
				inArray(ticketsThreads.categoryId, categoryIds),
			];

			// If the threads are not active according to Discord.
			if (stateInDiscord === '1') {
				const activeThreads = await interaction.guild.channels.fetchActiveThreads();
				const activeThreadsIds = [...activeThreads.threads.filter((thread) => !thread.locked).keys()];

				whereQueries.push(notInArray(ticketsThreads.threadId, activeThreadsIds));
			} else {
				// If the threads are not active according to the database state.
				whereQueries.push(ne(ticketsThreads.state, 'active'));
			}

			const categories = await database
				.select({
					categoryEmoji: ticketThreadsCategories.categoryEmoji,
					categoryTitle: ticketThreadsCategories.categoryTitle,
					count: database.$count(ticketsThreads, and(...whereQueries)),
				})
				.from(ticketThreadsCategories)
				.where(
					and(
						eq(ticketThreadsCategories.guildId, interaction.guildId),
						inArray(ticketThreadsCategories.id, categoryIds),
					),
				);

			await database.delete(ticketsThreads).where(and(...whereQueries));
			await interaction.followUp({
				embeds: [
					userEmbed(interaction)
						.setTitle('Purged Inactive Thread Tickets')
						.setDescription(
							`${interaction.member} purged ${categories.at(0)?.count.toString() ?? 'Unknown'} inactive ticket(s) in the following categories:
							${categories.map((category) => ThreadTicketing.titleAndEmoji(category.categoryTitle, category.categoryEmoji)).join(', ')}.`,
						),
				],
			});

			return interaction.deleteReply();
		}
	}
}
