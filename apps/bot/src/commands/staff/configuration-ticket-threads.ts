import {
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	ModalBuilder,
	PermissionFlagsBits,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
	channelMention,
	roleMention,
} from 'discord.js';
import {
	Autocomplete,
	type BaseInteraction,
	Command,
	Component,
	DeferReply,
	DeferUpdate,
	Modal,
} from '@ticketer/djs-framework';
import {
	and,
	asc,
	count,
	database,
	eq,
	like,
	not,
	sql,
	ticketThreadsCategories,
	ticketThreadsConfigurations,
} from '@ticketer/database';
import {
	extractEmoji,
	messageWithPagination,
	parseInteger,
	ticketThreadsOpeningMessageDescription,
	ticketThreadsOpeningMessageTitle,
	withPagination,
} from '@/utils';

const MAXIMUM_CATEGORY_AMOUNT = 10;
const CATEGORY_PAGE_SIZE = 2;

function HasGlobalConfiguration(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = async function (this: BaseInteraction.Interaction, { interaction }: BaseInteraction.Context) {
		if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			const [row] = await database
				.select()
				.from(ticketThreadsConfigurations)
				.where(eq(ticketThreadsConfigurations.guildId, interaction.guildId));

			if (!row) {
				const embed = this.userEmbedError(interaction.user).setDescription(
					'Please create a global thread ticket configuration before creating categories.',
				);

				return interaction.deferred
					? interaction.editReply({
							embeds: [embed],
						})
					: interaction.reply({ embeds: [embed], ephemeral: true });
			}
		}

		// eslint-disable-next-line prefer-rest-params
		return Reflect.apply(original, this, arguments) as () => unknown;
	};

	return descriptor;
}

function categoryViewEmbed(
	this: BaseInteraction.Interaction,
	context: Command.Context | Component.Context,
	categories: (typeof ticketThreadsCategories.$inferSelect)[],
) {
	return categories.map((category) =>
		this.userEmbed(context.interaction.user)
			.setTitle(`${category.categoryEmoji} ${category.categoryTitle}`)
			.setDescription(category.categoryDescription)
			.setFields(
				{
					name: 'Category Channel',
					value: category.channelId ? channelMention(category.channelId) : 'None',
					inline: true,
				},
				{
					name: 'Logs Channel',
					value: category.logsChannelId ? channelMention(category.logsChannelId) : 'None',
					inline: true,
				},
				{
					name: 'Ticket Managers',
					value: category.managers.length > 0 ? category.managers.map((id) => roleMention(id)).join(', ') : 'None',
					inline: true,
				},
				{
					name: '\u200B',
					value: '\u200B',
				},
				{
					name: 'Opening Message Title',
					value: ticketThreadsOpeningMessageTitle({
						categoryTitle: category.categoryTitle,
						displayName: context.interaction.user.displayName,
						locale: context.interaction.locale,
						title: category.openingMessageTitle,
					}),
					inline: true,
				},
				{
					name: 'Opening Message Description',
					value: ticketThreadsOpeningMessageDescription({
						categoryTitle: category.categoryTitle,
						description: category.openingMessageDescription,
						locale: context.interaction.locale,
						userMention: context.interaction.user.toString(),
					}),
					inline: true,
				},
				{
					name: '\u200B',
					value: '\u200B',
				},
				{
					name: 'Private Threads',
					value: category.privateThreads ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Thread Notifications',
					value: category.threadNotifications ? 'Enabled' : 'Disabled',
					inline: true,
				},
			),
	);
}

async function getCategories(
	this: BaseInteraction.Interaction,
	context: Command.Context | Component.Context,
	page = 0,
) {
	const categories = await withPagination({
		page,
		pageSize: CATEGORY_PAGE_SIZE,
		query: database
			.select()
			.from(ticketThreadsCategories)
			.where(eq(ticketThreadsCategories.guildId, context.interaction.guildId))
			.orderBy(asc(ticketThreadsCategories.id))
			.$dynamic(),
	});

	const embeds = categoryViewEmbed.call(this, context, categories);
	const components = messageWithPagination({
		previous: { customId: this.customId('ticket_threads_category_view_previous', page), disabled: page === 0 },
		next: {
			customId: this.customId('ticket_threads_category_view_next', page),
			disabled: categories.length < CATEGORY_PAGE_SIZE,
		},
	});

	return context.interaction.editReply({ components, embeds });
}

function categoryFieldsModal<T>(
	this: BaseInteraction.Interaction,
	context: Command.Context | Component.Context,
	options?: { id?: T; emoji?: string; title?: string; description?: string },
) {
	const emojiInput = (options?.emoji ? new TextInputBuilder().setValue(options.emoji) : new TextInputBuilder())
		.setCustomId(this.customId('emoji'))
		.setLabel('Emoji')
		.setRequired(true)
		.setMinLength(1)
		// 8 because of unicode.
		.setMaxLength(8)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('Write an emoji to be used for the category.');
	const titleInput = (options?.title ? new TextInputBuilder().setValue(options.title) : new TextInputBuilder())
		.setCustomId(this.customId('title'))
		.setLabel('Title')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('Write the title to be used for the category.');
	const descriptionInput = (
		options?.description ? new TextInputBuilder().setValue(options.description) : new TextInputBuilder()
	)
		.setCustomId(this.customId('description'))
		.setLabel('Description')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('Write the description to be used for the category.');

	const row1 = new ActionRowBuilder<TextInputBuilder>().setComponents(emojiInput);
	const row2 = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
	const row3 = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionInput);

	const modal = new ModalBuilder()
		.setCustomId(this.customId(`ticket_threads_category_fields${options?.id ? '_dynamic' : ''}`, options?.id))
		.setTitle('Category Emoji, Title, & Description')
		.setComponents(row1, row2, row3);

	return context.interaction.showModal(modal);
}

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
				),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('overview').setDescription('View the current global configuration of thread tickets.'),
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
							option.setName('title').setDescription("The category's title.").setAutocomplete(true).setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('delete')
						.setDescription('Delete a category from thread tickets.')
						.addStringOption((option) =>
							option.setName('title').setDescription("The category's title.").setAutocomplete(true).setRequired(true),
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
				switch (interaction.options.getSubcommand(true)) {
					case 'overview': {
						return this.overview({ interaction });
					}
					default: {
						return interaction.reply({
							embeds: [super.userEmbedError(interaction.user).setDescription('The subcommand could not be found.')],
							ephemeral: true,
						});
					}
				}
			}
		}
	}

	@DeferReply(false)
	async settingsGroup({ interaction }: Command.Context<'chat'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'active-tickets': {
				const activeTickets = interaction.options.getInteger('amount', true);
				const { guildId, user } = interaction;

				await database
					.insert(ticketThreadsConfigurations)
					.values({ activeTickets, guildId })
					.onDuplicateKeyUpdate({ set: { activeTickets } });

				const embed = super
					.userEmbed(user)
					.setTitle('Updated the Thead Ticket Configuration')
					.setDescription(
						`${user.toString()} updated the amount of active tickets a user may have at once to ${activeTickets}.`,
					);

				return interaction.editReply({ embeds: [embed] });
			}
			default: {
				return interaction.editReply({
					embeds: [super.userEmbedError(interaction.user).setDescription('The subcommand could not be found.')],
				});
			}
		}
	}

	@DeferReply(false)
	private async overview({ interaction }: Command.Context) {
		const { guildId, user } = interaction;
		const [result] = await database
			.select({ activeTickets: ticketThreadsConfigurations.activeTickets })
			.from(ticketThreadsConfigurations)
			.where(eq(ticketThreadsConfigurations.guildId, guildId))
			.limit(1);

		if (!result) {
			return interaction.editReply({
				embeds: [super.userEmbedError(user).setDescription('No thread ticket configuration could be found.')],
			});
		}

		const embed = super
			.userEmbed(user)
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
					embeds: [super.userEmbedError(interaction.user).setDescription('The subcommand could not be found.')],
					ephemeral: true,
				});
			}
		}
	}

	@DeferReply(false)
	private categoryViewConfiguration(context: Command.Context) {
		void getCategories.call(this, context);
	}

	@DeferReply(false)
	private async categoryConfiguration({ interaction }: Command.Context<'chat'>) {
		const id = parseInteger(interaction.options.getString('title', true));

		if (id === undefined) return;

		const [result] = await database
			.select({ emoji: ticketThreadsCategories.categoryEmoji, title: ticketThreadsCategories.categoryTitle })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.guildId, interaction.guildId), eq(ticketThreadsCategories.id, id)));

		if (!result) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.user)
						.setDescription('Please create a global thread ticket configuration before creating categories.'),
				],
			});
		}

		const embed = super.embed.setTitle(`${result.emoji} ${result.title}`);
		const categoriesMenu = new StringSelectMenuBuilder()
			.setCustomId(super.customId('ticket_threads_category_configuration', id))
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
					.setEmoji('🛡️')
					.setLabel('Ticket Managers')
					.setDescription('Choose the managers who are responsible for this category.')
					.setValue('managers'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('📔')
					.setLabel('Message Title & Description')
					.setDescription("Change the opening message's title and description.")
					.setValue('message_title_description'),
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
					.setEmoji('📣')
					.setLabel('Thread Notification')
					.setDescription('Toggle whether the new thread system message stays on.')
					.setValue('notification'),
			);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(categoriesMenu);

		return interaction.editReply({ components: [row], embeds: [embed] });
	}

	@DeferReply(false)
	@HasGlobalConfiguration
	private async categoryDelete({ interaction }: Command.Context<'chat'>) {
		try {
			const id = parseInteger(interaction.options.getString('title', true));

			if (id === undefined) return;

			// TODO: When the MariaDB driver gets released, change the query to use the RETURNING clause.
			const query = await database
				.delete(ticketThreadsCategories)
				.where(sql`${ticketThreadsCategories.id} = ${id} RETURNING ${ticketThreadsCategories.categoryTitle}`);

			const title = (query[0] as unknown as Pick<typeof ticketThreadsCategories.$inferSelect, 'categoryTitle'>[]).at(
				0,
			)?.categoryTitle;

			const embed = super
				.userEmbed(interaction.user)
				.setTitle('Deleted the Thread Ticket Category')
				.setDescription(`${interaction.user.toString()} deleted the category with the following title: ${title}.`);

			return interaction.editReply({ embeds: [embed] });
		} catch (error) {
			const isObject = (object: unknown): object is object =>
				typeof object === 'object' && !Array.isArray(object) && object !== null;

			if (isObject(error) && 'errno' in error && error.errno === 1451) {
				return interaction.editReply({
					embeds: [
						super
							.userEmbedError(interaction.user)
							.setDescription(
								'You must delete all of the tickets which has this category before deleting the category itself.',
							),
					],
				});
			}
		}
	}
}

export class AutocompleteInteraction extends Autocomplete.Interaction {
	public readonly name = 'configuration-ticket-threads';

	public async execute({ interaction }: Autocomplete.Context) {
		const { guildId, options } = interaction;
		const { name, value } = options.getFocused(true);

		if (name === 'title') {
			const categoriesList = await database
				.select({
					id: ticketThreadsCategories.id,
					title: ticketThreadsCategories.categoryTitle,
				})
				.from(ticketThreadsCategories)
				.where(
					and(eq(ticketThreadsCategories.guildId, guildId), like(ticketThreadsCategories.categoryTitle, `%${value}%`)),
				);

			return interaction.respond(categoriesList.map(({ id, title }) => ({ name: title, value: id.toString() })));
		}
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_threads_category_configuration'),
		super.dynamicCustomId('ticket_threads_category_configuration_channel'),
		super.dynamicCustomId('ticket_threads_category_configuration_logs_channel'),
		super.dynamicCustomId('ticket_threads_category_configuration_managers'),
		super.dynamicCustomId('ticket_threads_category_view_previous'),
		super.dynamicCustomId('ticket_threads_category_view_next'),
	];

	@HasGlobalConfiguration
	public execute({ interaction }: Component.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.dynamicCustomId('ticket_threads_category_configuration'): {
				return interaction.isStringSelectMenu() && this.categoryConfiguration({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_configuration_channel'):
			case super.dynamicCustomId('ticket_threads_category_configuration_logs_channel'): {
				return interaction.isChannelSelectMenu() && this.categoryChannel({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_configuration_managers'): {
				return interaction.isRoleSelectMenu() && this.categoryManagers({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_view_previous'):
			case super.dynamicCustomId('ticket_threads_category_view_next'): {
				interaction.isButton() && this.categoryView({ interaction });
				return;
			}
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.user).setDescription('The component ID could not be found.')],
					ephemeral: true,
				});
			}
		}
	}

	private categoryConfiguration({ interaction }: Component.Context<'string'>) {
		const value = interaction.values.at(0);

		switch (value) {
			case 'emoji_title_description': {
				return this.categoryFieldsModalValues({ interaction });
			}
			case 'channel':
			case 'logs_channel': {
				const { dynamicValue } = super.extractCustomId(interaction.customId);

				const channelMenu = new ChannelSelectMenuBuilder()
					.setCustomId(super.customId(`ticket_threads_category_configuration_${value}`, dynamicValue))
					.setMinValues(1)
					.setMaxValues(1)
					.setPlaceholder(
						`Choose a channel for ${value === 'channel' ? 'tickets to be created in' : 'logs to be sent in'}.`,
					)
					.setChannelTypes(ChannelType.GuildText);

				const channelRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(channelMenu);

				return interaction.reply({ components: [channelRow] });
			}
			case 'managers': {
				const { dynamicValue } = super.extractCustomId(interaction.customId);
				const managersMenu = new RoleSelectMenuBuilder()
					.setCustomId(super.customId('ticket_threads_category_configuration_managers', dynamicValue))
					.setMinValues(0)
					.setMaxValues(10)
					.setPlaceholder('Choose the ticket managers of this category.');

				const row = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(managersMenu);

				return interaction.reply({ components: [row] });
			}
			case 'message_title_description': {
				return this.categoryMessageTitleDescriptionValues({ interaction });
			}
			case 'private':
			case 'notification': {
				return this.categoryPrivateAndNotification({ interaction });
			}
			case 'silent_pings': {
				return this.categorySilentPings({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.user).setDescription('The selected value could not be found.')],
					ephemeral: true,
				});
			}
		}
	}

	// It is not possible to defer modals...
	private async categoryFieldsModalValues({ interaction }: Component.Context) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const id = parseInteger(dynamicValue);

		if (id === undefined) return;

		const [row] = await database
			.select({
				emoji: ticketThreadsCategories.categoryEmoji,
				title: ticketThreadsCategories.categoryTitle,
				description: ticketThreadsCategories.categoryDescription,
			})
			.from(ticketThreadsCategories)
			.where(eq(ticketThreadsCategories.id, id));

		if (!row) {
			return interaction.reply({
				embeds: [
					super.userEmbedError(interaction.user).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		void categoryFieldsModal.call(this, { interaction }, { id, ...row });
	}

	@DeferUpdate
	private async categoryChannel({ interaction }: Component.Context<'channel'>) {
		const { customId, dynamicValue } = super.extractCustomId(interaction.customId, true);
		const type = customId.includes('logs') ? 'logs channel' : 'ticket channel';
		const id = parseInteger(dynamicValue);

		if (id === undefined) return;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const channel = interaction.channels.at(0)!;

		await database
			.update(ticketThreadsCategories)
			.set({
				...(type === 'ticket channel' ? { channelId: channel.id } : { logsChannelId: channel.id }),
			})
			.where(eq(ticketThreadsCategories.id, id));

		const embed = super
			.userEmbed(interaction.user)
			.setTitle('Updated the Thread Ticket Category')
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			.setDescription(`${interaction.user.toString()} updated the ${type} to ${channel.toString()}.`);

		return interaction.editReply({ embeds: [embed], components: [] });
	}

	@DeferUpdate
	private async categoryManagers({ interaction }: Component.Context<'role'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const id = parseInteger(dynamicValue);

		if (id === undefined) return;

		const managers = interaction.roles.map((role) => role.id);

		await database.update(ticketThreadsCategories).set({ managers }).where(eq(ticketThreadsCategories.id, id));

		const roles = managers.map((id) => roleMention(id)).join(', ');
		const embed = super
			.userEmbed(interaction.user)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.user.toString()} updated the managers of the category to: ${
					managers.length > 0 ? roles : 'none'
				}.`,
			);

		return interaction.editReply({ embeds: [embed], components: [] });
	}

	@DeferUpdate
	private categoryView({ interaction }: Component.Context<'button'>) {
		const { customId, dynamicValue } = super.extractCustomId(interaction.customId, true);
		const type = customId.includes('previous') ? 'previous' : 'next';
		const currentPage = parseInteger(dynamicValue);

		if (currentPage === undefined) return;

		const page = currentPage + (type === 'next' ? 1 : -1);

		void getCategories.call(this, { interaction }, page);
	}

	// It is not possible to defer modals...
	private async categoryMessageTitleDescriptionValues({ interaction }: Component.Context) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const id = parseInteger(dynamicValue);

		if (id === undefined) return;

		const [row] = await database
			.select({
				title: ticketThreadsCategories.openingMessageTitle,
				description: ticketThreadsCategories.openingMessageDescription,
			})
			.from(ticketThreadsCategories)
			.where(eq(ticketThreadsCategories.id, id));

		if (!row) {
			return interaction.reply({
				embeds: [
					super.userEmbedError(interaction.user).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		const titleInput = (row.title ? new TextInputBuilder().setValue(row.title) : new TextInputBuilder())
			.setCustomId(super.customId('title'))
			.setLabel('Message Title')
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(100)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Write "{category}" and "{member}" to mention them.');
		const descriptionInput = (
			row.description ? new TextInputBuilder().setValue(row.description) : new TextInputBuilder()
		)
			.setCustomId(super.customId('description'))
			.setLabel('Message Description')
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(500)
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Write "{category}" and "{member}" to mention them.');

		const row1 = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
		const row2 = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionInput);

		const modal = new ModalBuilder()
			.setCustomId(super.customId('ticket_threads_category_message', dynamicValue))
			.setTitle('Opening Message Title, & Description')
			.setComponents(row1, row2);

		return interaction.showModal(modal);
	}

	@DeferReply(false)
	private async categoryPrivateAndNotification({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const type = interaction.values.at(0)?.includes('private') ? 'private threads' : 'thread notification';
		const id = parseInteger(dynamicValue);

		if (id === undefined) return;

		await database
			.update(ticketThreadsCategories)
			.set(
				type === 'private threads'
					? { privateThreads: not(ticketThreadsCategories.privateThreads) }
					: { threadNotifications: not(ticketThreadsCategories.threadNotifications) },
			)
			.where(eq(ticketThreadsCategories.id, id));

		const embed = super
			.userEmbed(interaction.user)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(`${interaction.user.toString()} has toggled the ${type} enabled option.`);

		return interaction.editReply({ embeds: [embed] });
	}

	@DeferReply(false)
	private async categorySilentPings({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const id = parseInteger(dynamicValue);

		if (id === undefined) return;

		await database
			.update(ticketThreadsCategories)
			.set({
				silentPings: not(ticketThreadsCategories.silentPings),
			})
			.where(eq(ticketThreadsCategories.id, id));

		const embed = super
			.userEmbed(interaction.user)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(`${interaction.user.toString()} has toggled the silent pings enabled option.`);

		return interaction.editReply({ embeds: [embed] });
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [
		super.customId('ticket_threads_category_fields'),
		super.dynamicCustomId('ticket_threads_category_fields_dynamic'),
		super.dynamicCustomId('ticket_threads_category_message'),
	];

	@DeferReply(false)
	@HasGlobalConfiguration
	public async execute({ interaction }: Modal.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.customId('ticket_threads_category_fields'):
			case super.dynamicCustomId('ticket_threads_category_fields_dynamic'): {
				return this.categoryFields({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_message'): {
				return this.categoryMessageTitleDescription({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.user).setDescription('The modal ID could not be found.')],
					ephemeral: true,
				});
			}
		}
	}

	private async categoryFields({ interaction }: Modal.Context) {
		const { customId, fields, guildId, user } = interaction;
		const { dynamicValue } = super.extractCustomId(customId);
		const emoji = fields.getTextInputValue('emoji');

		const categoryEmoji = extractEmoji(emoji);
		const categoryTitle = fields.getTextInputValue('title');
		const categoryDescription = fields.getTextInputValue('description');

		if (!categoryEmoji) {
			return interaction.editReply({
				embeds: [super.userEmbedError(user).setDescription('The submitted emoji is not a Unicode emoji.')],
			});
		}

		if (dynamicValue) {
			const id = parseInteger(dynamicValue);

			if (id === undefined) return;

			await database
				.update(ticketThreadsCategories)
				.set({ categoryDescription, categoryEmoji, categoryTitle })
				.where(eq(ticketThreadsCategories.id, id));
		} else {
			const [row] = await database
				.select({ amount: count() })
				.from(ticketThreadsCategories)
				.where(eq(ticketThreadsCategories.guildId, guildId));
			const amount = row?.amount ?? 0;

			if (amount >= MAXIMUM_CATEGORY_AMOUNT) {
				return interaction.editReply({
					embeds: [
						super
							.userEmbedError(user)
							.setDescription(`There are too many categories, you may not have more than ${MAXIMUM_CATEGORY_AMOUNT}.`),
					],
				});
			}

			await database
				.insert(ticketThreadsCategories)
				.values({ categoryDescription, categoryEmoji, categoryTitle, guildId });
		}

		const embed = super
			.userEmbed(user)
			.setTitle(`${dynamicValue ? 'Updated the' : 'Created a'} Thread Ticket Category`)
			.setDescription(
				`${user.toString()} ${
					dynamicValue ? 'updated' : 'created'
				} the thread ticket category with the following details:`,
			)
			.setFields(
				{
					name: 'Emoji',
					value: categoryEmoji,
					inline: true,
				},
				{
					name: 'Title',
					value: categoryTitle,
					inline: true,
				},
				{
					name: 'Description',
					value: categoryDescription,
				},
			);

		return interaction.editReply({
			embeds: [embed],
		});
	}

	private async categoryMessageTitleDescription({ interaction }: Modal.Context) {
		const { customId, fields, user } = interaction;
		const { dynamicValue } = super.extractCustomId(customId, true);
		const id = parseInteger(dynamicValue);

		if (id === undefined) return;

		const openingMessageTitle = fields.getTextInputValue('title');
		const openingMessageDescription = fields.getTextInputValue('description');

		await database
			.update(ticketThreadsCategories)
			.set({ openingMessageTitle, openingMessageDescription })
			.where(eq(ticketThreadsCategories.id, id));

		const embed = super
			.userEmbed(user)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(`${user.toString()} updated the opening message title and description to the following:`)
			.setFields(
				{
					name: 'Title',
					value: openingMessageTitle,
					inline: true,
				},
				{
					name: 'Description',
					value: openingMessageDescription,
					inline: true,
				},
			);

		return interaction.editReply({ embeds: [embed] });
	}
}
