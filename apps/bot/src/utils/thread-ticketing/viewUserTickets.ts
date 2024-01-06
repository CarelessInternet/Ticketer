import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { type Snowflake, channelMention, userMention } from 'discord.js';
import { and, asc, count, database, eq, sql, ticketThreadsCategories, ticketsThreads } from '@ticketer/database';
import { capitalise, messageWithPagination, withPagination } from '..';

export async function viewUserTickets(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat' | 'user'> | Component.Context,
	userId: Snowflake,
	page = 0,
) {
	const PAGE_SIZE = 3;
	const user = await interaction.client.users.fetch(userId);

	const { globalAmount, tickets } = await database.transaction(async (tx) => {
		const query = database
			.select({
				categoryEmoji: ticketThreadsCategories.categoryEmoji,
				categoryTitle: ticketThreadsCategories.categoryTitle,
				managers: ticketThreadsCategories.managers,
				state: ticketsThreads.state,
				threadId: ticketsThreads.threadId,
			})
			.from(ticketsThreads)
			.where(
				and(
					eq(ticketsThreads.authorId, user.id),
					// We do this to not accidentally display tickets not belonging to the manager's role(s),
					// as well as avoiding duplicate results as a result of that.
					sql`JSON_OVERLAPS(${ticketThreadsCategories.managers}, '${sql.raw(
						JSON.stringify([...interaction.member.roles.cache.keys()]),
					)}')`,
				),
			)
			.leftJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id))
			.orderBy(asc(ticketsThreads.categoryId))
			.$dynamic();

		const tickets = await withPagination({
			page,
			pageSize: PAGE_SIZE,
			query,
		});

		const amount = await tx
			.select({ amount: count() })
			.from(ticketsThreads)
			.where(and(eq(ticketsThreads.guildId, interaction.guildId), eq(ticketsThreads.authorId, user.id)));

		return { globalAmount: amount.at(0)?.amount, tickets };
	});

	const embeds = tickets.map((ticket) =>
		this.userEmbed(user)
			.setTitle(`${ticket.categoryEmoji} ${ticket.categoryTitle}`)
			.setFields(
				{
					name: 'Thread Channel',
					value: channelMention(ticket.threadId),
					inline: true,
				},
				{
					name: 'State',
					value: capitalise(
						ticket.state === 'archived'
							? 'closed'
							: ticket.state === 'lockedAndArchived'
								? 'Locked and Closed'
								: ticket.state,
					),
					inline: true,
				},
			),
	);
	const components = messageWithPagination({
		previous: {
			customId: this.customId('ticket_threads_categories_view_user_previous', `${page}_${user.id}`),
			disabled: page === 0,
		},
		next: {
			customId: this.customId('ticket_threads_categories_view_user_next', `${page}_${user.id}`),
			disabled: tickets.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({
		allowedMentions: {
			parse: [],
		},
		components,
		content: `Total amount of tickets by ${userMention(user.id)} in the server: ${globalAmount ?? 0}.`,
		embeds,
	});
}
