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
import { Command, DeferReply } from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	inlineCode,
	MessageFlags,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { prettifyError } from 'zod';
import { ThreadTicketing } from '@/utils';
import { categoryFieldsModal, getCategories, HasGlobalConfiguration } from './helpers';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('configuration-ticket-threads')
		.setDescription('Edit the configuration for tickets that use threads.')
		.setDefaultMemberPermissions(
			PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads,
		)
		.addSubcommandGroup((group) =>
			group
				.setName('global-settings')
				.setDescription('Edit the global settings of thread tickets.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('active-tickets')
						.setDescription('Change the amount of active tickets a user may have at once.')
						.addIntegerOption((option) =>
							option
								.setName('amount')
								.setDescription('The amount of active tickets at once.')
								.setRequired(true)
								.setMinValue(1)
								.setMaxValue(255),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand.setName('overview').setDescription('View the current global configuration of thread tickets.'),
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName('categories')
				.setDescription('The configuration for categories used in thread tickets.')
				.addSubcommand((subcommand) =>
					subcommand.setName('view').setDescription('View the current categories for thread tickets.'),
				)
				.addSubcommand((subcommand) =>
					subcommand.setName('create').setDescription('Create a category for thread tickets.'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('edit')
						.setDescription('Edit a category for thread tickets.')
						.addStringOption((option) =>
							option
								.setName('title')
								.setDescription('The title of the category of which you want to edit.')
								.setAutocomplete(true)
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('delete')
						.setDescription('Delete a category from thread tickets.')
						.addStringOption((option) =>
							option
								.setName('title')
								.setDescription('The title of the category of which you want to delete.')
								.setAutocomplete(true)
								.setRequired(true),
						),
				),
		);

	public async execute({ interaction }: Command.Context<'chat'>) {
		switch (interaction.options.getSubcommandGroup(false)) {
			case 'global-settings': {
				return this.settingsGroup({ interaction });
			}
			case 'categories': {
				return this.categoriesGroup({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.member).setDescription('The subcommand group could not be found.')],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferReply()
	async settingsGroup({ interaction }: Command.Context<'chat'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'active-tickets': {
				const {
					data: activeTickets,
					error,
					success,
				} = ticketThreadsConfigurationsInsertSchema.shape.activeTickets.safeParse(
					interaction.options.getInteger('amount', true),
				);

				if (!success) {
					return interaction.editReply({
						embeds: [super.userEmbedError(interaction.member).setDescription(prettifyError(error))],
					});
				}

				const { guildId, member } = interaction;

				await database
					.insert(ticketThreadsConfigurations)
					.values({ activeTickets, guildId })
					.onDuplicateKeyUpdate({ set: { activeTickets } });

				const embed = super
					.userEmbed(member)
					.setTitle('Updated the Thead Ticket Configuration')
					.setDescription(
						`${member.toString()} updated the amount of active tickets a user may have at once to ${activeTickets.toString()}.`,
					);

				return interaction.editReply({ embeds: [embed] });
			}
			case 'overview': {
				return this.overview({ interaction });
			}
			default: {
				return interaction.editReply({
					embeds: [super.userEmbedError(interaction.member).setDescription('The subcommand could not be found.')],
				});
			}
		}
	}

	@DeferReply()
	private async overview({ interaction }: Command.Context) {
		const [result] = await database
			.select({ activeTickets: ticketThreadsConfigurations.activeTickets })
			.from(ticketThreadsConfigurations)
			.where(eq(ticketThreadsConfigurations.guildId, interaction.guildId));

		if (!result) {
			return interaction.editReply({
				embeds: [
					super.userEmbedError(interaction.member).setDescription('No thread ticket configuration could be found.'),
				],
			});
		}

		const embed = super.embed
			.setTitle('Thread Ticket Configuration')
			.setDescription('Here is the global configuration for thread tickets:')
			.setFields({
				name: '# of Active Tickets',
				value: result.activeTickets.toString(),
			});

		return interaction.editReply({ embeds: [embed] });
	}

	private categoriesGroup({ interaction }: Command.Context<'chat'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'view': {
				this.categoryViewConfiguration({ interaction });
				return;
			}
			case 'create': {
				void categoryFieldsModal.call(this, { interaction });
				return;
			}
			case 'edit': {
				return this.categoryConfiguration({ interaction });
			}
			case 'delete': {
				return this.categoryDelete({ interaction });
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
	private categoryViewConfiguration(context: Command.Context) {
		void getCategories.call(this, context);
	}

	@DeferReply()
	private async categoryConfiguration({ interaction }: Command.Context<'chat'>) {
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(interaction.options.getString('title', true)));

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(prettifyError(error))],
			});
		}

		const [result] = await database
			.select({ emoji: ticketThreadsCategories.categoryEmoji, title: ticketThreadsCategories.categoryTitle })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!result) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.member)
						.setDescription('Please create a global thread ticket configuration before creating categories.'),
				],
			});
		}

		const embed = super.embed.setTitle(ThreadTicketing.titleAndEmoji(result.title, result.emoji));
		const categoriesMenu = new StringSelectMenuBuilder()
			.setCustomId(super.customId('ticket_threads_category_configuration', categoryId))
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

		return interaction.editReply({ components: [row], embeds: [embed] });
	}

	@DeferReply()
	@HasGlobalConfiguration
	private async categoryDelete({ interaction }: Command.Context<'chat'>) {
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(interaction.options.getString('title', true)));

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(prettifyError(error))],
			});
		}

		const [row] = await database
			.select({ amount: count(), title: ticketThreadsCategories.categoryTitle })
			.from(ticketsThreads)
			.where(
				and(
					eq(ticketsThreads.categoryId, categoryId),
					eq(ticketsThreads.guildId, interaction.guildId),
					eq(ticketsThreads.state, 'active'),
				),
			)
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));
		const amount = row?.amount ?? 0;

		if (amount > 0) {
			const confirmButton = new ButtonBuilder()
				.setCustomId(super.customId('ticket_threads_category_delete_confirm', categoryId))
				.setEmoji('☑️')
				.setLabel('Confirm')
				.setStyle(ButtonStyle.Success);
			const cancelButton = new ButtonBuilder()
				.setCustomId(super.customId('ticket_threads_category_delete_cancel', categoryId))
				.setEmoji('✖️')
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Danger);

			const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(confirmButton, cancelButton);
			const embed = super
				.userEmbed(interaction.member)
				.setTitle('Are you sure you want to proceed?')
				.setDescription(
					`The category you want to delete still has active tickets. Are you sure you want to delete the ${row?.title ? inlineCode(row.title) : 'No Title Found'} category?
					In addition, you would have to manually delete each thread which has that category.`,
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

		const embed = super
			.userEmbed(interaction.member)
			.setTitle('Deleted the Thread Ticket Category')
			.setDescription(
				`${interaction.member.toString()} deleted the category with the following title: ${result?.title ? inlineCode(result.title) : 'No Title Found'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}
}
