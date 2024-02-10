import {
	ActionRowBuilder,
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
import { type BaseInteraction, Command, Component, DeferReply, DeferUpdate, Modal } from '@ticketer/djs-framework';
import { automaticThreadsConfigurations, database, desc, eq } from '@ticketer/database';
import {
	automaticThreadsEmbed,
	automaticThreadsOpeningMessageDescription,
	automaticThreadsOpeningMessageTitle,
	messageWithPagination,
	parseInteger,
	withPagination,
} from '@/utils';

function IsTextChannel(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = function (this: Command.Interaction, { interaction }: Command.Context<'chat'>) {
		const { type } = interaction.options.getChannel('channel', true);

		if (type !== ChannelType.GuildText) {
			const embeds = [
				this.userEmbedError(interaction.user).setDescription('The specified channel is not a text channel.'),
			];

			return interaction.deferred ? interaction.editReply({ embeds }) : interaction.reply({ embeds });
		}

		// eslint-disable-next-line prefer-rest-params
		return Reflect.apply(original, this, arguments) as () => unknown;
	};

	return descriptor;
}

async function getConfigurations(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat'> | Component.Context<'button'>,
	page = 0,
) {
	const PAGE_SIZE = 3;
	const configurations = await withPagination({
		page,
		pageSize: PAGE_SIZE,
		query: database
			.select()
			.from(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.guildId, interaction.guildId))
			.orderBy(desc(automaticThreadsConfigurations.channelId))
			.$dynamic(),
	});

	const embeds = configurations.map((config) =>
		this.userEmbed(interaction.user)
			.setTitle('Automatic Threads Configuration')
			.setDescription(`The configuration for automatic threads in the channel ${channelMention(config.channelId)}:`)
			.setFields(
				{
					name: 'Opening Message Title',
					value: automaticThreadsOpeningMessageTitle({
						displayName: interaction.user.displayName,
						title: config.openingMessageTitle,
					}),
					inline: true,
				},
				{
					name: 'Opening Message Description',
					value: automaticThreadsOpeningMessageDescription({
						description: config.openingMessageDescription,
						userMention: interaction.user.toString(),
					}),
					inline: true,
				},
				{
					name: 'Managers',
					value: config.managers.length > 0 ? config.managers.map((id) => roleMention(id)).join(', ') : 'None',
				},
			),
	);

	const components = messageWithPagination({
		previous: { customId: this.customId('ticket_automatic_threads_view_previous', page), disabled: page === 0 },
		next: {
			customId: this.customId('ticket_automatic_threads_view_next', page),
			disabled: configurations.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({ components, embeds });
}

function openingMessageModal<T>(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat'> | Component.Context<'string'>,
	options: { id: T; title?: string; description?: string },
) {
	const titleInput = (options.title ? new TextInputBuilder().setValue(options.title) : new TextInputBuilder())
		.setCustomId(this.customId('title'))
		.setLabel('Message Title')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('Write "{member}" to mention the user.');
	const descriptionInput = (
		options.description ? new TextInputBuilder().setValue(options.description) : new TextInputBuilder()
	)
		.setCustomId(this.customId('description'))
		.setLabel('Message Description')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(500)
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('Write "{member}" to mention the user.');

	const row1 = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
	const row2 = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionInput);

	const modal = new ModalBuilder()
		.setCustomId(this.customId('ticket_automatic_threads_configuration_opening_message', options.id))
		.setTitle('Opening Message Title & Description')
		.setComponents(row1, row2);

	return interaction.showModal(modal);
}

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('configuration-automatic-threads')
		.setDescription('Edit the configuration for when a thread is created in a text channel by a member.')
		.setDefaultMemberPermissions(
			PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads,
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('overview').setDescription('View the current configurations for automatic threads.'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a new configuration for automatic threads.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The text channel where the bot creates a thread for the user.')
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit an automatic threads configuration.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel to edit the configuration from.')
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete an automatic threads configuration.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel to delete the configuration from.')
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true),
				),
		);

	public execute(context: Command.Context<'chat'>) {
		switch (context.interaction.options.getSubcommand(true)) {
			case 'overview': {
				this.configurationOverview(context);
				return;
			}
			case 'create': {
				this.createConfiguration(context);
				return;
			}
			case 'edit': {
				return this.editConfiguration(context);
			}
			case 'delete': {
				return this.deleteConfiguration(context);
			}
			default: {
				return context.interaction.reply({
					embeds: [super.userEmbedError(context.interaction.user).setDescription('The subcommand could not be found.')],
					ephemeral: true,
				});
			}
		}
	}

	@DeferReply(false)
	private configurationOverview(context: Command.Context<'chat'>) {
		void getConfigurations.call(this, context);
	}

	@IsTextChannel
	private createConfiguration(context: Command.Context<'chat'>) {
		void openingMessageModal.call(this, context, { id: context.interaction.options.getChannel('channel', true).id });
	}

	@DeferReply(false)
	@IsTextChannel
	private async editConfiguration({ interaction }: Command.Context<'chat'>) {
		const channel = interaction.options.getChannel('channel', true);
		const [result] = await database
			.select()
			.from(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.channelId, channel.id));

		if (!result) {
			return interaction.editReply({
				embeds: [
					super.userEmbedError(interaction.user).setDescription(
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						`The automatic threads configuration for the channel ${channel.toString()} could not be found. Please create one instead of editing it.`,
					),
				],
			});
		}

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(super.customId('ticket_automatic_threads_configuration_menu', channel.id))
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder('Edit one of the following automatic threads options:')
			.setOptions(
				new StringSelectMenuOptionBuilder()
					.setEmoji('📔')
					.setLabel('Message Title & Description')
					.setDescription("Change the opening message's title and description.")
					.setValue('message_title_description'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🛡️')
					.setLabel('Ticket Managers')
					.setDescription('Choose the managers who are responsible for this text channel.')
					.setValue('managers'),
			);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);

		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		return interaction.editReply({ components: [row], content: channel.toString() });
	}

	@DeferReply(false)
	@IsTextChannel
	private async deleteConfiguration({ interaction }: Command.Context<'chat'>) {
		const channel = interaction.options.getChannel('channel', true);
		await database
			.delete(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.channelId, channel.id));

		return interaction.editReply({
			embeds: [
				super.userEmbed(interaction.user).setTitle('Deleted an Automatic Threads Configuration').setDescription(
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					`${interaction.user.toString()} deleted an automatic threads configuration in the channel ${channel.toString()} if one existed.`,
				),
			],
		});
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_automatic_threads_configuration_menu'),
		super.dynamicCustomId('ticket_automatic_threads_configuration_managers'),
		super.dynamicCustomId('ticket_automatic_threads_view_previous'),
		super.dynamicCustomId('ticket_automatic_threads_view_next'),
	];

	public execute({ interaction }: Component.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.dynamicCustomId('ticket_automatic_threads_configuration_menu'): {
				return interaction.isStringSelectMenu() && this.handleConfigurationMenu({ interaction });
			}
			case super.dynamicCustomId('ticket_automatic_threads_configuration_managers'): {
				return interaction.isRoleSelectMenu() && this.updateManagers({ interaction });
			}
			case super.dynamicCustomId('ticket_automatic_threads_view_previous'):
			case super.dynamicCustomId('ticket_automatic_threads_view_next'): {
				interaction.isButton() && this.configurationOverview({ interaction });
				return;
			}
			default: {
				return interaction.reply({
					embeds: [
						super.userEmbedError(interaction.user).setDescription('The select menu custom ID could not be found.'),
					],
					ephemeral: true,
				});
			}
		}
	}

	private handleConfigurationMenu(context: Component.Context<'string'>) {
		switch (context.interaction.values.at(0)) {
			case 'message_title_description': {
				return this.openingMessage(context);
			}
			case 'managers': {
				return this.managersMenu(context);
			}
			default: {
				return context.interaction.reply({
					embeds: [
						super.userEmbedError(context.interaction.user).setDescription('The selected value could not be found.'),
					],
					ephemeral: true,
				});
			}
		}
	}

	private async openingMessage(context: Component.Context<'string'>) {
		const { dynamicValue: id } = super.extractCustomId(context.interaction.customId, true);
		const [row] = await database
			.select({
				title: automaticThreadsConfigurations.openingMessageTitle,
				description: automaticThreadsConfigurations.openingMessageDescription,
			})
			.from(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.channelId, id));

		if (!row) {
			return context.interaction.reply({
				embeds: [
					super
						.userEmbedError(context.interaction.user)
						.setDescription('No automatic threads configuration for the channel could be found.'),
				],
				ephemeral: true,
			});
		}

		const { description, title } = row;

		void openingMessageModal.call(this, context, { description, id, title });
	}

	private managersMenu({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const managersMenu = new RoleSelectMenuBuilder()
			.setCustomId(super.customId('ticket_automatic_threads_configuration_managers', dynamicValue))
			.setMinValues(0)
			.setMaxValues(10)
			.setPlaceholder('Choose the managers of the automatic threads.');

		const row = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(managersMenu);

		return interaction.reply({ components: [row] });
	}

	@DeferUpdate
	private async updateManagers({ interaction }: Component.Context<'role'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const managers = interaction.roles.map((role) => role.id);

		await database
			.update(automaticThreadsConfigurations)
			.set({ managers })
			.where(eq(automaticThreadsConfigurations.channelId, dynamicValue));

		const roles = managers.map((id) => roleMention(id)).join(', ');
		const embed = super
			.userEmbed(interaction.user)
			.setTitle('Updated the Automatic Threads Managers')
			.setDescription(
				`${interaction.user.toString()} updated the managers of the automatic threads in ${channelMention(dynamicValue)} to: ${
					managers.length > 0 ? roles : 'none'
				}.`,
			);

		return interaction.editReply({ embeds: [embed], components: [] });
	}

	@DeferUpdate
	private configurationOverview(context: Component.Context<'button'>) {
		const { customId, dynamicValue } = super.extractCustomId(context.interaction.customId, true);
		const type = customId.includes('previous') ? 'previous' : 'next';
		const currentPage = parseInteger(dynamicValue);

		if (currentPage === undefined) return;

		const page = currentPage + (type === 'next' ? 1 : -1);

		void getConfigurations.call(this, context, page);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [super.dynamicCustomId('ticket_automatic_threads_configuration_opening_message')];

	public execute(context: Modal.Context) {
		const { customId } = super.extractCustomId(context.interaction.customId);

		switch (customId) {
			case super.dynamicCustomId('ticket_automatic_threads_configuration_opening_message'): {
				return this.createConfigurationOrUpdateOpeningMessage(context);
			}
			default: {
				return context.interaction.reply({
					embeds: [
						super.userEmbedError(context.interaction.user).setDescription('The modal custom ID could not be found.'),
					],
					ephemeral: true,
				});
			}
		}
	}

	@DeferReply(false)
	private async createConfigurationOrUpdateOpeningMessage({ interaction }: Modal.Context) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const channel = await interaction.guild.channels.fetch(dynamicValue);

		if (!channel || channel.type !== ChannelType.GuildText) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.user).setDescription('The channel is not a text channel.')],
			});
		}

		const title = interaction.fields.getTextInputValue('title');
		const description = interaction.fields.getTextInputValue('description');

		await database
			.insert(automaticThreadsConfigurations)
			.values({
				channelId: dynamicValue,
				guildId: interaction.guildId,
				openingMessageTitle: title,
				openingMessageDescription: description,
			})
			.onDuplicateKeyUpdate({ set: { openingMessageTitle: title, openingMessageDescription: description } });

		return interaction.editReply({
			embeds: [
				super.userEmbed(interaction.user).setTitle('Created/Updated an Automatic Threads Configuration').setDescription(
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					`${interaction.user.toString()} created or updated an automatic threads configuration in ${channel.toString()}. An example opening message can be seen in the embed below.`,
				),
				automaticThreadsEmbed({ description, embed: super.embed, title, user: interaction.user }),
			],
		});
	}
}
