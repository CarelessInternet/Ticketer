import { and, count, database, eq, ticketsThreads, ticketThreadsCategories } from '@ticketer/database';
import { customId, DeferReply, Subcommand, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { ChannelType, inlineCode } from 'discord.js';
import { managerIntersection, ThreadTicketing } from '@/utils';

export default class extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'edit-tickets',
		subcommandNames: ['edit'],
	});

	@DeferReply()
	public async execute({ interaction }: Subcommand.Context) {
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
					userEmbedError({
						client: interaction.client,
						description:
							"Either the ticket could not be found (e.g. the ticket was deleted or closed) or you are not a manager of the ticket's category.",
						member: interaction.member,
					}),
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
				userEmbed(interaction)
					.setTitle('Updated Ticket State')
					.setDescription(
						`${interaction.member} updated the bot's ticket state of ${channel} to ${inlineCode(ThreadTicketing.ticketState(state))}.`,
					),
			],
		});
	}
}

export class PurgePrune extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'edit-tickets',
		subcommandNames: ['purge', 'prune'],
	});

	@DeferReply({ ephemeral: true })
	public async execute({ interaction }: Subcommand.Context) {
		const categories = await ThreadTicketing.categoryList({
			filterManagerIds: interaction.member.roles,
			guildId: interaction.guildId,
		});

		if (categories.length === 0) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'There are no categories of which you can purge/prune inactive tickets in.',
						member: interaction.member,
					}),
				],
			});
		}

		const state = interaction.options.getString('state', false) as ThreadTicketing.TicketState | null;
		const stateInDiscord = interaction.options.getBoolean('state-source', false);
		const row = ThreadTicketing.categoryListSelectMenuRow({
			categories,
			customId: customId(
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
