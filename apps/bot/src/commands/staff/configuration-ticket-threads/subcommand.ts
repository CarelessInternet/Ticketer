import {
	and,
	count,
	database,
	eq,
	ticketsThreads,
	ticketThreadsCategories,
	ticketThreadsCategoriesSelectSchema,
	ticketThreadsConfigurations,
	ticketThreadsConfigurationsInsertSchema,
} from '@ticketer/database';
import { customId, DeferReply, embed, Subcommand, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { prettifyError } from 'zod';
import { ThreadTicketing } from '@/utils';
import { categoryFieldsModal, getCategories, HasGlobalConfiguration } from './helpers';

export default class extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-ticket-threads',
		parentSubcommandGroupName: 'global-settings',
		subcommandNames: ['active-tickets'],
	});

	@DeferReply()
	public async execute({ interaction }: Subcommand.Context) {
		const {
			data: activeTickets,
			error,
			success,
		} = ticketThreadsConfigurationsInsertSchema.shape.activeTickets.safeParse(
			interaction.options.getInteger('amount', true),
		);

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
					}),
				],
			});
		}

		const { guildId } = interaction;

		await database
			.insert(ticketThreadsConfigurations)
			.values({ activeTickets, guildId })
			.onDuplicateKeyUpdate({ set: { activeTickets } });

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thead Ticket Configuration')
			.setDescription(
				`${interaction.member} updated the amount of active tickets a user may have at once to ${activeTickets.toString()}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}
}

export class GlobalOverview extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-ticket-threads',
		parentSubcommandGroupName: 'global-settings',
		subcommandNames: ['overview'],
	});

	@DeferReply()
	public async execute({ interaction }: Subcommand.Context) {
		const [result] = await database
			.select({ activeTickets: ticketThreadsConfigurations.activeTickets })
			.from(ticketThreadsConfigurations)
			.where(eq(ticketThreadsConfigurations.guildId, interaction.guildId));

		if (!result) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No thread ticket configuration could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const reply = embed(interaction)
			.setTitle('Thread Ticket Configuration')
			.setDescription('Here is the global configuration for thread tickets:')
			.setFields({
				name: '# of Active Tickets',
				value: result.activeTickets.toString(),
			});

		return interaction.editReply({ embeds: [reply] });
	}
}

export class CategoriesView extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-ticket-threads',
		parentSubcommandGroupName: 'categories',
		subcommandNames: ['view'],
	});

	@DeferReply()
	public execute(context: Subcommand.Context) {
		void getCategories(context);
	}
}

export class CategoriesCreate extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-ticket-threads',
		parentSubcommandGroupName: 'categories',
		subcommandNames: ['create'],
	});

	public execute(context: Subcommand.Context) {
		void categoryFieldsModal(context);
	}
}

export class CategoriesEdit extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-ticket-threads',
		parentSubcommandGroupName: 'categories',
		subcommandNames: ['edit'],
	});

	@DeferReply()
	public async execute({ interaction }: Subcommand.Context) {
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(interaction.options.getString('title', true)));

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		const [result] = await database
			.select({ emoji: ticketThreadsCategories.categoryEmoji, title: ticketThreadsCategories.categoryTitle })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!result) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'Please create a global thread ticket configuration before creating categories.',
						member: interaction.member,
					}),
				],
			});
		}

		const reply = embed(interaction).setTitle(ThreadTicketing.titleAndEmoji(result.title, result.emoji));
		const categoriesMenu = new StringSelectMenuBuilder()
			.setCustomId(customId('ticket_threads_category_configuration', categoryId))
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder('Edit one of the following ticket category options:')
			.setOptions(
				new StringSelectMenuOptionBuilder()
					.setEmoji('📰')
					.setLabel('Emoji, Title, & Description')
					.setDescription('Change the emoji, title, and description used for this category.')
					.setValue('emoji_title_description'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🛡️')
					.setLabel('Ticket Managers')
					.setDescription('Choose the managers who are responsible for this category.')
					.setValue('managers'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('#️⃣')
					.setLabel('Channel')
					.setDescription('Change the channel where tickets of this category go.')
					.setValue('channel'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('📜')
					.setLabel('Logs Channel')
					.setDescription('Change the channel where logs get sent during ticket activity for the category.')
					.setValue('logs_channel'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('📔')
					.setLabel('Message Title & Description')
					.setDescription("Change the opening message's title and description.")
					.setValue('message_title_description'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🚦')
					.setLabel('Allowed Author Actions')
					.setDescription('Change what actions the ticket author can use.')
					.setValue('allowed_author_actions'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🛃')
					.setLabel('Private Thread')
					.setDescription('Toggle whether the tickets are private.')
					.setValue('private'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🔔')
					.setLabel('Silent Pings')
					.setDescription('Toggle whether managers get pinged (with noise) on ticket creation.')
					.setValue('silent_pings'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('⏩')
					.setLabel('Skip Modal')
					.setDescription('Toggle whether modals are skipped.')
					.setValue('skip_modals'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('📣')
					.setLabel('Thread Notification')
					.setDescription('Toggle whether the new thread system message stays on.')
					.setValue('notification'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('📑')
					.setLabel('Thread Title')
					.setDescription("Edit the created thread's title.")
					.setValue('thread_title'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('📝')
					.setLabel('Title & Description')
					.setDescription('Toggle whether ticket authors must write a title and description.')
					.setValue('ticket_title_description'),
			);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(categoriesMenu);

		return interaction.editReply({ components: [row], embeds: [reply] });
	}
}

export class CategoriesDelete extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-ticket-threads',
		parentSubcommandGroupName: 'categories',
		subcommandNames: ['delete'],
	});

	@DeferReply()
	@HasGlobalConfiguration
	public async execute({ interaction }: Subcommand.Context) {
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(interaction.options.getString('title', true)));

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		const [row] = await database
			.select({ amount: count(), title: ticketThreadsCategories.categoryTitle })
			.from(ticketsThreads)
			.where(and(eq(ticketsThreads.categoryId, categoryId), eq(ticketsThreads.guildId, interaction.guildId)))
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));
		const amount = row?.amount ?? 0;

		if (amount > 0) {
			const confirmButton = new ButtonBuilder()
				.setCustomId(customId('ticket_threads_category_delete_confirm', categoryId))
				.setEmoji('☑️')
				.setLabel('Confirm')
				.setStyle(ButtonStyle.Success);
			const cancelButton = new ButtonBuilder()
				.setCustomId(customId('ticket_threads_category_delete_cancel', categoryId))
				.setEmoji('✖️')
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Danger);

			const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(confirmButton, cancelButton);
			const embed = userEmbed(interaction)
				.setTitle('Are you sure you want to proceed?')
				.setDescription(
					`
						The category you want to delete potentially has active tickets.
						Are you sure you want to delete the ${row?.title ? inlineCode(row.title) : 'No Title Found'} category?
						In addition, you would have to manually delete each thread which has that category.
					`,
				);

			return interaction.editReply({
				components: [actionRow],
				embeds: [embed],
			});
		}

		// TODO: change to use the RETURNING clause for MariaDB when it gets released.
		const [result] = await database
			.select({ title: ticketThreadsCategories.categoryTitle })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));
		await database
			.delete(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const embed = userEmbed(interaction)
			.setTitle('Deleted the Thread Ticket Category')
			.setDescription(
				`${interaction.member} deleted the category with the following title: ${result?.title ? inlineCode(result.title) : 'No Title Found'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}
}
