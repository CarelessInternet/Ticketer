import {
	type APIApplicationCommandOptionChoice,
	ChannelType,
	MessageFlags,
	PermissionFlagsBits,
	inlineCode,
} from 'discord.js';
import { Command, Component, DeferReply, DeferUpdate } from '@ticketer/djs-framework';
import { ThreadTicketing, managerIntersection } from '@/utils';
import {
	and,
	count,
	database,
	eq,
	inArray,
	ne,
	notInArray,
	ticketThreadsCategories,
	ticketsThreads,
} from '@ticketer/database';
import { getTranslations } from '@/i18n';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('edit-tickets')
		.setDescription('Edit thread tickets.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit the state of a thread ticket.')
				.addChannelOption((option) =>
					option
						.setName('ticket')
						.setDescription('The thread channel of the ticket.')
						.addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread)
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName('state')
						.setDescription('The new state to apply to the ticket.')
						.setRequired(true)
						.setChoices(
							...ticketsThreads.state.enumValues.map(
								(state) =>
									({
										name: ThreadTicketing.ticketState(state),
										name_localizations: getTranslations(`tickets.threads.categories.ticketState.${state}`),
										value: state,
									}) satisfies APIApplicationCommandOptionChoice<string>,
							),
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('purge')
				.setDescription('Purge thread tickets in selected categories that are not an active thread.')
				.addBooleanOption((option) =>
					option
						.setName('state-source')
						.setDescription("Purge by the thread state in Discord (true) or the bot's saved state (false).")
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			// No boolean option for the state source as fetching the archived threads per channel can lead to API spam.
			subcommand
				.setName('prune')
				.setDescription('Prune thread tickets in selected categories that have a specified state saved by the bot.')
				.addStringOption((option) =>
					option
						.setName('state')
						.setDescription('The state of tickets to prune.')
						.setRequired(true)
						.setChoices(
							...ticketsThreads.state.enumValues.map(
								(state) =>
									({
										name: ThreadTicketing.ticketState(state),
										name_localizations: getTranslations(`tickets.threads.categories.ticketState.${state}`),
										value: state,
									}) satisfies APIApplicationCommandOptionChoice<string>,
							),
						),
				),
		);

	public execute({ interaction }: Command.Context<'chat'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'edit': {
				return this.editTicketState({ interaction });
			}
			case 'purge':
			case 'prune': {
				return this.purgeTickets({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.member).setDescription('The subcommand could not be found.')],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferReply()
	private async editTicketState({ interaction }: Command.Context<'chat'>) {
		const channel = interaction.options.getChannel('ticket', true, [
			ChannelType.PublicThread,
			ChannelType.PrivateThread,
		]);

		const [row] = await database
			.select({ count: count() })
			.from(ticketsThreads)
			.where(
				and(
					eq(ticketsThreads.guildId, interaction.guildId),
					eq(ticketsThreads.threadId, channel.id),
					managerIntersection(ticketThreadsCategories.managers, interaction.member.roles),
				),
			)
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));

		if (!row?.count) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.member)
						.setDescription(
							"Either the ticket could not be found (e.g. the ticket was deleted or closed) or you are not a manager of the ticket's category.",
						),
				],
			});
		}

		const state = interaction.options.getString('state', true) as ThreadTicketing.TicketState;

		await database
			.update(ticketsThreads)
			.set({ state })
			.where(and(eq(ticketsThreads.guildId, interaction.guildId), eq(ticketsThreads.threadId, channel.id)));

		await interaction.editReply({
			embeds: [
				super
					.userEmbed(interaction.member)
					.setTitle('Updated Ticket State')
					.setDescription(
						`${interaction.member.toString()} updated the bot's ticket state of ${channel.toString()} to ${inlineCode(ThreadTicketing.ticketState(state))}.`,
					),
			],
		});
	}

	@DeferReply({ ephemeral: true })
	private async purgeTickets({ interaction }: Command.Context<'chat'>) {
		const categories = await ThreadTicketing.categoryList({
			filterManagerIds: interaction.member.roles,
			guildId: interaction.guildId,
		});

		if (categories.length === 0) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.member)
						.setDescription('There are no categories of which you can purge/prune inactive tickets in.'),
				],
			});
		}

		const state = interaction.options.getString('state', false) as ThreadTicketing.TicketState | null;
		const stateInDiscord = interaction.options.getBoolean('state-source', false);
		const row = ThreadTicketing.categoryListSelectMenuRow({
			categories,
			customId: super.customId(
				'ticket_threads_categories_edit_tickets_purge_prune_menu',
				`${(+Boolean(stateInDiscord)).toString()}_${state ?? ''}`,
			),
			locale: interaction.locale,
			maxValues: categories.length,
			minValues: 1,
			placeholder: 'Choose the categories to purge/prune inactive tickets.',
		});

		return interaction.editReply({ components: [row] });
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.customId('ticket_threads_categories_edit_tickets_purge_prune_menu'),
		super.dynamicCustomId('ticket_threads_categories_edit_tickets_purge_prune_menu'),
	];

	@DeferUpdate
	public async execute({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
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
					super
						.userEmbed(interaction.member)
						.setTitle('Pruned Thread Tickets')
						.setDescription(
							`${interaction.member.toString()} pruned ${categories.at(0)?.count.toString() ?? 'Unknown'} ` +
								`ticket(s) with the state ${inlineCode(ThreadTicketing.ticketState(state))} in the following categories:
							${categories.map((category) => inlineCode(ThreadTicketing.titleAndEmoji(category.categoryTitle, category.categoryEmoji))).join(', ')}.`,
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
					super
						.userEmbed(interaction.member)
						.setTitle('Purged Inactive Thread Tickets')
						.setDescription(
							`${interaction.member.toString()} purged ${categories.at(0)?.count.toString() ?? 'Unknown'} inactive ticket(s) in the following categories:
							${categories.map((category) => inlineCode(ThreadTicketing.titleAndEmoji(category.categoryTitle, category.categoryEmoji))).join(', ')}.`,
						),
				],
			});

			return interaction.deleteReply();
		}
	}
}
