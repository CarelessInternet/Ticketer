import {
	ActionRowBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
	userMention,
} from 'discord.js';
import { type BaseInteraction, Command, DeferReply, Modal } from '@ticketer/djs-framework';
import { count, database, eq, ticketThreadsCategories, ticketThreadsConfiguration } from '@ticketer/database';
import { extractEmoji } from '@/utils';

const MAXIMUM_CATEGORY_AMOUNT = 10;

function HasGlobalConfiguration(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = async function (this: BaseInteraction.Interaction, { interaction }: BaseInteraction.Context) {
		if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
			const [row] = await database
				.select({ amount: count() })
				.from(ticketThreadsConfiguration)
				.where(eq(ticketThreadsConfiguration.guildId, interaction.guildId));

			if (!row || row.amount <= 0) {
				return interaction.editReply({
					embeds: [
						this.userEmbedError(interaction.user).setDescription(
							'Please create a global thread ticket configuration before creating categories.',
						),
					],
				});
			}
		}

		return Reflect.apply(original, this, arguments);
	};

	return descriptor;
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
					.insert(ticketThreadsConfiguration)
					.values({ activeTickets, guildId })
					.onDuplicateKeyUpdate({ set: { activeTickets } });

				const embed = super
					.userEmbed(user)
					.setTitle('Updated the Thead Ticket Configuration')
					.setDescription(
						`${userMention(user.id)} updated the amount of active tickets a user may have at once to ${activeTickets}.`,
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
		const table = await database
			.select()
			.from(ticketThreadsConfiguration)
			.where(eq(ticketThreadsConfiguration.guildId, guildId))
			.limit(1);
		const result = table.at(0);

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

	private categoryFieldsModal({ interaction }: Command.Context, allRequired = false) {
		const emojiInput = new TextInputBuilder()
			.setCustomId('emoji')
			.setLabel('Emoji')
			.setRequired(allRequired)
			.setMinLength(1)
			// 8 because of unicode.
			.setMaxLength(8)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Write an emoji to be used for the category.');
		const titleInput = new TextInputBuilder()
			.setCustomId('title')
			.setLabel('Title')
			.setRequired(allRequired)
			.setMinLength(1)
			.setMaxLength(100)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Write the title to be used for the category.');
		const descriptionInput = new TextInputBuilder()
			.setCustomId('description')
			.setLabel('Description')
			.setRequired(allRequired)
			.setMinLength(1)
			.setMaxLength(100)
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Write the description to be used for the category.');

		const row1 = new ActionRowBuilder<TextInputBuilder>().setComponents(emojiInput);
		const row2 = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
		const row3 = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionInput);

		const modal = new ModalBuilder()
			.setCustomId('ticket_threads_category_fields')
			.setTitle('Category Emoji, Title, & Description')
			.setComponents(row1, row2, row3);

		return interaction.showModal(modal);
	}

	private async categoriesGroup({ interaction }: Command.Context<'chat'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'view': {
				return;
			}
			case 'create': {
				return this.categoryFieldsModal({ interaction }, true);
			}
			case 'edit': {
				return;
			}
			case 'delete': {
				return;
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

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = ['ticket_threads_category_fields'];

	public async execute({ interaction }: Modal.Context) {
		switch (interaction.customId) {
			case 'ticket_threads_category_fields': {
				return this.categoryFields({ interaction });
			}
		}
	}

	@DeferReply(false)
	@HasGlobalConfiguration
	private async categoryFields({ interaction }: Modal.Context) {
		const { fields, guildId, user } = interaction;
		const emoji = fields.getTextInputValue('emoji') || undefined;

		const categoryEmoji = extractEmoji(emoji);
		const categoryTitle = fields.getTextInputValue('title');
		const categoryDescription = fields.getTextInputValue('description') || undefined;

		if (!categoryEmoji) {
			return interaction.editReply({
				embeds: [super.userEmbedError(user).setDescription('The submitted emoji is not a Unicode emoji.')],
			});
		}

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

		const embed = super
			.userEmbed(user)
			.setTitle('Created a Category')
			.setDescription(
				`${userMention(
					user.id,
				)} created a new thread ticket category with the following emoji, title, and description:\n\n${categoryEmoji}\n\n${categoryTitle}\n\n${categoryDescription}`,
			);

		return interaction.editReply({
			embeds: [embed],
		});
	}
}
