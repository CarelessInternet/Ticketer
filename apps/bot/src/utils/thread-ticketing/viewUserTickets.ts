import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { type Snowflake, channelMention } from 'discord.js';
import { and, asc, count, database, eq, ticketThreadsCategories, ticketsThreads } from '@ticketer/database';
import { managerIntersection, messageWithPagination, ticketState, withPagination } from '..';

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
				managers: ticketThreadsCategories.managers,
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
			.orderBy(asc(ticketsThreads.categoryId))
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
			.setTitle(`${ticket.categoryEmoji} ${ticket.categoryTitle}`)
			.setFields(
				{
					name: 'Thread Channel',
					value: channelMention(ticket.threadId),
					inline: true,
				},
				{
					name: 'State',
					value: ticketState(ticket.state),
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
		content: `Total amount of tickets by ${user.toString()} in the server: ${globalAmount ?? 0}.`,
		embeds,
	});
}
