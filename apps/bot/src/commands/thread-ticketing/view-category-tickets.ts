import { and, asc, count, database, eq, like, ticketsThreads, ticketThreadsCategories } from '@ticketer/database';
import {
	Autocomplete,
	Command,
	Component,
	customId,
	DeferReply,
	DeferUpdate,
	dynamicCustomId,
	embed,
	userEmbedError,
} from '@ticketer/djs-framework';
import { channelMention, PermissionFlagsBits, userMention } from 'discord.js';
import { goToPage, managerIntersection, messageWithPagination, ThreadTicketing, withPagination } from '@/utils';

interface ViewCategoryTicketsOptions {
	categoryId?: string | null;
	page?: number;
}

async function viewCategoryTickets(
	{ interaction }: Command.Context<'chat'> | Component.Context,
	{ categoryId, page = 0 }: ViewCategoryTicketsOptions = {},
) {
	const PAGE_SIZE = 3;
	const id = Number.parseInt(String(categoryId), 10);

	if (categoryId && Number.isNaN(id)) return;

	const { tickets, totalAmount } = await database.transaction(async (tx) => {
		const whereQuery = and(
			eq(ticketsThreads.guildId, interaction.guildId),
			managerIntersection(ticketThreadsCategories.managers, interaction.member.roles),
			categoryId ? eq(ticketsThreads.categoryId, id) : undefined,
		);

		const query = tx
			.select({
				categoryEmoji: ticketThreadsCategories.categoryEmoji,
				categoryTitle: ticketThreadsCategories.categoryTitle,
				state: ticketsThreads.state,
				threadId: ticketsThreads.threadId,
				userId: ticketsThreads.authorId,
			})
			.from(ticketsThreads)
			.where(whereQuery)
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id))
			.orderBy(asc(ticketsThreads.categoryId))
			.$dynamic();

		const tickets = await withPagination({
			page,
			pageSize: PAGE_SIZE,
			query,
		});
		const [totalAmount] = await tx
			.select({ count: count() })
			.from(ticketsThreads)
			.where(whereQuery)
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));

		return { totalAmount: totalAmount?.count, tickets };
	});

	const embeds = tickets.map((ticket) =>
		embed(interaction)
			.setTitle(ThreadTicketing.titleAndEmoji(ticket.categoryTitle, ticket.categoryEmoji))
			.setFields(
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
					value: ThreadTicketing.ticketState(ticket.state),
					inline: true,
				},
			),
	);
	const components = messageWithPagination({
		previous: {
			customId: customId('ticket_threads_categories_view_category_previous', `${page.toString()}_${categoryId ?? ''}`),
			disabled: page === 0,
		},
		next: {
			customId: customId('ticket_threads_categories_view_category_next', `${page.toString()}_${categoryId ?? ''}`),
			disabled: tickets.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({
		components,
		content: `Total amount of the category's tickets in the server: ${String(totalAmount ?? 0)}.`,
		embeds,
	});
}

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('view-category-tickets')
		.setDescription('View the tickets in a specific category.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addStringOption((option) =>
			option
				.setName('title')
				.setDescription("The category's title that you have access to.")
				.setRequired(false)
				.setAutocomplete(true),
		);

	@DeferReply()
	public execute(context: Command.Context<'chat'>) {
		void viewCategoryTickets(context, { categoryId: context.interaction.options.getString('title', false) });
	}
}

export class AutocompleteInteraction extends Autocomplete.Interaction {
	public readonly name = 'view-category-tickets';

	public async execute({ interaction }: Autocomplete.Context) {
		const { guildId, member, options } = interaction;
		const { name } = options.getFocused(true);

		if (name === 'title') {
			const value = options.getFocused();

			const categoriesList = await database
				.select({
					id: ticketThreadsCategories.id,
					title: ticketThreadsCategories.categoryTitle,
				})
				.from(ticketThreadsCategories)
				.where(
					and(
						eq(ticketThreadsCategories.guildId, guildId),
						like(ticketThreadsCategories.categoryTitle, `%${value}%`),
						managerIntersection(ticketThreadsCategories.managers, member.roles),
					),
				);

			return interaction.respond(categoriesList.map(({ id, title }) => ({ name: title, value: id.toString() })));
		}
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_threads_categories_view_category_previous'),
		dynamicCustomId('ticket_threads_categories_view_category_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context) {
		const { success, additionalData, error, page } = goToPage.call(this, context.interaction);

		if (!success) {
			return context.interaction.editReply({
				components: [],
				content: '',
				embeds: [userEmbedError({ ...context.interaction, description: error })],
			});
		}

		void viewCategoryTickets(context, { categoryId: additionalData.at(0), page });
	}
}
