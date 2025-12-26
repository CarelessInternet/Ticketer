import { and, database, desc, eq, ticketsThreads, ticketThreadsCategories } from '@ticketer/database';
import { type Command, type Component, customId, userEmbed } from '@ticketer/djs-framework';
import { channelMention, type Snowflake } from 'discord.js';
import { translate } from '@/i18n';
import { managerIntersection, messageWithPagination, ThreadTicketing, withPagination } from '@/utils';

interface ViewUserTicketsOptions {
	page?: number;
	userId: Snowflake;
}

export async function viewUserTickets(
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

		const globalAmount = await tx.$count(
			ticketsThreads,
			and(eq(ticketsThreads.guildId, interaction.guildId), eq(ticketsThreads.authorId, user.id)),
		);

		return { globalAmount, tickets };
	});

	const translations = translate(interaction.isChatInputCommand() ? interaction.guildLocale : interaction.locale)
		.commands['view-user-tickets'].common.command;
	const embeds = tickets.map((ticket) =>
		userEmbed({ client: interaction.client, user })
			.setTitle(ThreadTicketing.titleAndEmoji(ticket.categoryTitle, ticket.categoryEmoji))
			.setFields(
				{
					name: translations.embeds[0].fields[0].name(),
					value: channelMention(ticket.threadId),
					inline: true,
				},
				{
					name: translations.embeds[0].fields[1].name(),
					value: ThreadTicketing.ticketState(ticket.state),
					inline: true,
				},
			),
	);
	const components = messageWithPagination({
		locale: interaction.ephemeral ? interaction.locale : interaction.guildLocale,
		previous: {
			customId: customId('ticket_threads_categories_view_user_previous', `${page.toString()}_${user.id}`),
			disabled: page === 0,
		},
		next: {
			customId: customId('ticket_threads_categories_view_user_next', `${page.toString()}_${user.id}`),
			disabled: tickets.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({
		allowedMentions: {
			parse: [],
		},
		components,
		content: translations.content({ amount: globalAmount, member: user.toString() }),
		embeds,
	});
}
