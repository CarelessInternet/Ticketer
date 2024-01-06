import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { type Snowflake, channelMention } from 'discord.js';
import {
	and,
	asc,
	database,
	eq,
	getTableColumns,
	sql,
	ticketThreadsCategories,
	ticketsThreads,
} from '@ticketer/database';
import { capitalise, messageWithPagination, withPagination } from '..';

export async function viewUserTickets(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat' | 'user'> | Component.Context,
	userId: Snowflake,
	page?: number,
) {
	const PAGE_SIZE = 3;

	page ??= 0;
	const user = await interaction.client.users.fetch(userId);

	const { state, threadId } = getTableColumns(ticketsThreads);
	const { categoryEmoji, categoryTitle, managers } = getTableColumns(ticketThreadsCategories);
	const query = database
		.select({
			categoryEmoji,
			categoryTitle,
			managers,
			state,
			threadId,
		})
		.from(ticketsThreads)
		.leftJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id))
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
		.orderBy(asc(ticketsThreads.categoryId))
		.$dynamic();

	const tickets = await withPagination({
		page,
		pageSize: PAGE_SIZE,
		query,
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
			customId: this.customId('ticket_threads_categories_view_user_previous', `${page}_${userId}`),
			disabled: page === 0,
		},
		next: {
			customId: this.customId('ticket_threads_categories_view_user_next', `${page}_${userId}`),
			disabled: tickets.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({ components, embeds });
}
