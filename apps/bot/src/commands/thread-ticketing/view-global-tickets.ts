import { type BaseInteraction, Command, Component, DeferReply, DeferUpdate } from '@ticketer/djs-framework';
import { PermissionFlagsBits, channelMention, userMention } from 'discord.js';
import { and, count, database, desc, eq, ticketThreadsCategories, ticketsThreads } from '@ticketer/database';
import { messageWithPagination, ticketState, withPagination } from '@/utils';

type TicketState = typeof ticketsThreads.$inferSelect.state;

interface ViewGlobalTicketsOptions {
	state?: TicketState;
	page?: number;
}

async function viewGlobalTickets(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat'> | Component.Context,
	{ state, page = 0 }: ViewGlobalTicketsOptions = {},
) {
	const PAGE_SIZE = 3;

	const { globalAmount, tickets } = await database.transaction(async (tx) => {
		const query = tx
			.select({
				categoryEmoji: ticketThreadsCategories.categoryEmoji,
				categoryTitle: ticketThreadsCategories.categoryTitle,
				state: ticketsThreads.state,
				threadId: ticketsThreads.threadId,
				userId: ticketsThreads.authorId,
			})
			.from(ticketsThreads)
			.where(and(eq(ticketsThreads.guildId, interaction.guildId), state ? eq(ticketsThreads.state, state) : undefined))
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
			.where(eq(ticketsThreads.guildId, interaction.guildId));

		return { globalAmount: row?.amount, tickets };
	});

	const embeds = tickets.map((ticket) =>
		this.embed.setTitle(`${ticket.categoryEmoji} ${ticket.categoryTitle}`).setFields(
			{
				name: 'Thread Channel',
				value: channelMention(ticket.threadId),
				inline: true,
			},
			{
				name: 'Ticket Author',
				value: userMention(ticket.userId),
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
			customId: this.customId('ticket_threads_categories_view_global_previous', `${page}_${state ?? ''}`),
			disabled: page === 0,
		},
		next: {
			customId: this.customId('ticket_threads_categories_view_global_next', `${page}_${state ?? ''}`),
			disabled: tickets.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({
		components,
		content: `Total amount of tickets in the server: ${globalAmount ?? 0}.`,
		embeds,
	});
}

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('view-global-tickets')
		.setDescription('View all of the tickets in the server.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageThreads)
		.addStringOption((option) =>
			option
				.setName('state')
				.setDescription("Filter by the tickets' states.")
				.setRequired(false)
				.setChoices(...ticketsThreads.state.enumValues.map((state) => ({ name: ticketState(state), value: state }))),
		);

	@DeferReply(false)
	public execute(context: Command.Context<'chat'>) {
		void viewGlobalTickets.call(this, context, {
			state: context.interaction.options.getString('state', false) as TicketState,
		});
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_threads_categories_view_global_previous'),
		super.dynamicCustomId('ticket_threads_categories_view_global_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context) {
		const { customId, dynamicValue } = super.extractCustomId(context.interaction.customId, true);
		const [pageAsString, state] = dynamicValue.split('_') as [string, TicketState | undefined];
		const page = Number.parseInt(pageAsString) + (customId.includes('next') ? 1 : -1);

		void viewGlobalTickets.call(this, context, { state, page });
	}
}
