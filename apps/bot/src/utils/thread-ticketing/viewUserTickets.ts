import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { type Snowflake, channelMention } from 'discord.js';
import { ThreadTicketing, managerIntersection, messageWithPagination, withPagination } from '..';
import { and, count, database, desc, eq, ticketThreadsCategories, ticketsThreads } from '@ticketer/database';

interface ViewUserTicketsOptions {
	page?: number;
	userId: Snowflake;
}

export async function viewUserTickets(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat' | 'user'> | Component.Context,
	{ page = 0, userId }: ViewUserTicketsOptions,
) {
	const PAGE_SIZE = 3;
	const user = await interaction.client.users.fetch(userId);

	const { globalAmount, tickets } = await database.transaction(async (tx) => {
		const query = tx
			.select({
				categoryEmoji: ticketThreadsCategories.categoryEmoji,
				categoryTitle: ticketThreadsCategories.categoryTitle,
				state: ticketsThreads.state,
				threadId: ticketsThreads.threadId,
			})
			.from(ticketsThreads)
			.where(
				and(
					eq(ticketsThreads.authorId, user.id),
					eq(ticketsThreads.guildId, interaction.guildId),
					managerIntersection(ticketThreadsCategories.managers, interaction.member.roles),
				),
			)
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id))
			.orderBy(desc(ticketsThreads.threadId))
			.$dynamic();

		const tickets = await withPagination({
			page,
			pageSize: PAGE_SIZE,
			query,
		});

		const [row] = await tx
			.select({ amount: count() })
			.from(ticketsThreads)
			.where(and(eq(ticketsThreads.guildId, interaction.guildId), eq(ticketsThreads.authorId, user.id)));

		return { globalAmount: row?.amount, tickets };
	});

	const embeds = tickets.map((ticket) =>
		this.userEmbed(user)
			.setTitle(ThreadTicketing.titleAndEmoji(ticket.categoryTitle, ticket.categoryEmoji))
			.setFields(
				{
					name: 'Thread Channel',
					value: channelMention(ticket.threadId),
					inline: true,
				},
				{
					name: 'State',
					value: ThreadTicketing.ticketState(ticket.state),
					inline: true,
				},
			),
	);
	const components = messageWithPagination({
		previous: {
			customId: this.customId('ticket_threads_categories_view_user_previous', `${page.toString()}_${user.id}`),
			disabled: page === 0,
		},
		next: {
			customId: this.customId('ticket_threads_categories_view_user_next', `${page.toString()}_${user.id}`),
			disabled: tickets.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({
		allowedMentions: {
			parse: [],
		},
		components,
		content: `Total amount of tickets by ${user.toString()} in the server: ${String(globalAmount ?? 0)}.`,
		embeds,
	});
}
