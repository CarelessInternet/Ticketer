import {
	Autocomplete,
	type BaseInteraction,
	Command,
	Component,
	DeferReply,
	DeferUpdate,
} from '@ticketer/djs-framework';
import { PermissionFlagsBits, channelMention, userMention } from 'discord.js';
import { ThreadTicketing, goToPage, managerIntersection, messageWithPagination, withPagination } from '@/utils';
import { and, asc, count, database, eq, like, ticketThreadsCategories, ticketsThreads } from '@ticketer/database';

interface ViewCategoryTicketsOptions {
	categoryId?: string | null;
	page?: number;
}

async function viewCategoryTickets(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat'> | Component.Context,
	{ categoryId, page = 0 }: ViewCategoryTicketsOptions = {},
) {
	const PAGE_SIZE = 3;
	const id = Number.parseInt(String(categoryId));

	if (categoryId && Number.isNaN(id)) return;

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
			.where(
				and(
					eq(ticketsThreads.guildId, interaction.guildId),
					managerIntersection(ticketThreadsCategories.managers, interaction.member.roles),
					categoryId ? eq(ticketsThreads.categoryId, id) : undefined,
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
			.where(eq(ticketsThreads.guildId, interaction.guildId));

		return { globalAmount: row?.amount, tickets };
	});

	const embeds = tickets.map((ticket) =>
		this.embed.setTitle(ThreadTicketing.titleAndEmoji(ticket.categoryTitle, ticket.categoryEmoji)).setFields(
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
			customId: this.customId(
				'ticket_threads_categories_view_category_previous',
				`${page.toString()}_${categoryId ?? ''}`,
			),
			disabled: page === 0,
		},
		next: {
			customId: this.customId('ticket_threads_categories_view_category_next', `${page.toString()}_${categoryId ?? ''}`),
			disabled: tickets.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({
		components,
		content: `Total amount of tickets in the server: ${String(globalAmount ?? 0)}.`,
		embeds,
	});
}

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('view-category-tickets')
		.setDescription('View your tickets to resolve as a manager.')
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
		void viewCategoryTickets.call(this, context, { categoryId: context.interaction.options.getString('title', false) });
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
		super.dynamicCustomId('ticket_threads_categories_view_category_previous'),
		super.dynamicCustomId('ticket_threads_categories_view_category_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context) {
		const { success, additionalData, error, page } = goToPage.call(this, context.interaction);

		if (!success) {
			return context.interaction.editReply({
				components: [],
				content: '',
				embeds: [super.userEmbedError(context.interaction.member).setDescription(error)],
			});
		}

		void viewCategoryTickets.call(this, context, { categoryId: additionalData.at(0), page });
	}
}
