import { and, database, desc, eq, ticketsThreads, ticketThreadsCategories } from '@ticketer/database';
import {
	Command,
	Component,
	customId,
	DeferReply,
	DeferUpdate,
	dynamicCustomId,
	embed,
	userEmbedError,
} from '@ticketer/djs-framework';
import { channelMention } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { goToPage, messageWithPagination, ThreadTicketing, withPagination } from '@/utils';

interface ViewTicketsOptions {
	page?: number;
	state?: ThreadTicketing.TicketState | null;
}

async function viewTickets(
	{ interaction }: Command.Context<'chat'> | Component.Context,
	{ page = 0, state }: ViewTicketsOptions,
) {
	const PAGE_SIZE = 3;

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
					eq(ticketsThreads.guildId, interaction.guildId),
					eq(ticketsThreads.authorId, interaction.member.id),
					state ? eq(ticketsThreads.state, state) : undefined,
				),
			)
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id))
			.orderBy(desc(ticketsThreads.categoryId))
			.$dynamic();

		const tickets = await withPagination({
			page,
			pageSize: PAGE_SIZE,
			query,
		});
		const globalAmount = await tx.$count(ticketsThreads, eq(ticketsThreads.guildId, interaction.guildId));

		return { globalAmount, tickets };
	});

	const translations = translate(interaction.locale).commands['show-tickets'].command;
	const embeds = tickets.map((ticket) =>
		embed(interaction)
			.setTitle(ThreadTicketing.titleAndEmoji(ticket.categoryTitle, ticket.categoryEmoji))
			.setFields(
				{
					name: translations.embeds[0].fields[0].name(),
					value: channelMention(ticket.threadId),
					inline: true,
				},
				{
					name: translations.embeds[0].fields[1].name(),
					value: ThreadTicketing.ticketState(ticket.state, interaction.locale),
					inline: true,
				},
			),
	);

	const components = messageWithPagination({
		locale: interaction.locale,
		previous: {
			customId: customId('ticket_threads_categories_view_tickets_previous', `${page.toString()}_${state ?? ''}`),
			disabled: page === 0,
			label: translations.buttons.previous.label(),
		},
		next: {
			customId: customId('ticket_threads_categories_view_tickets_next', `${page.toString()}_${state ?? ''}`),
			disabled: tickets.length < PAGE_SIZE,
			label: translations.buttons.next.label(),
		},
	});

	return interaction.editReply({
		components,
		content: translations.content({ amount: globalAmount }),
		embeds,
	});
}

const dataTranslations = translate().commands['show-tickets'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.show-tickets.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.show-tickets.data.description'))
		.addStringOption((option) =>
			option
				.setName(dataTranslations.options[0].name())
				.setNameLocalizations(getTranslations('commands.show-tickets.data.options.0.name'))
				.setDescription(dataTranslations.options[0].description())
				.setDescriptionLocalizations(getTranslations('commands.show-tickets.data.options.0.description'))
				.setRequired(false)
				.setChoices(
					...ticketsThreads.state.enumValues.map((state) => ({
						name: ThreadTicketing.ticketState(state),
						name_localizations: getTranslations(`tickets.threads.categories.ticketState.${state}`),
						value: state,
					})),
				),
		);

	@DeferReply({ ephemeral: true })
	public execute(context: Command.Context<'chat'>) {
		void viewTickets(context, {
			state: context.interaction.options.getString(
				dataTranslations.options[0].name(),
				false,
			) as ThreadTicketing.TicketState,
		});
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_threads_categories_view_tickets_previous'),
		dynamicCustomId('ticket_threads_categories_view_tickets_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context) {
		const { success, additionalData, error, page } = goToPage(context.interaction);

		if (!success) {
			return context.interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({
						client: context.interaction.client,
						description: error,
						member: context.interaction.member,
					}),
				],
			});
		}

		void viewTickets(context, {
			state: additionalData.at(0) as ViewTicketsOptions['state'] | undefined,
			page,
		});
	}
}
