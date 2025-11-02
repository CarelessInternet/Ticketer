import {
	ActionRowBuilder,
	ChannelType,
	HeadingLevel,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	PermissionFlagsBits,
	RoleSelectMenuBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
	bold,
	channelMention,
	heading,
	roleMention,
} from 'discord.js';
import { type BaseInteraction, Command, Component, DeferReply, DeferUpdate, Modal } from '@ticketer/djs-framework';
import {
	and,
	automaticThreadsConfigurations,
	automaticThreadsConfigurationsInsertSchema,
	automaticThreadsConfigurationsSelectSchema,
	database,
	desc,
	eq,
} from '@ticketer/database';
import { automaticThreadsContainer, fetchChannel, goToPage, messageWithPagination, withPagination } from '@/utils';
import { prettifyError } from 'zod';

function IsTextChannel(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = function (this: Command.Interaction, { interaction }: Command.Context<'chat'>) {
		const { type } = interaction.options.getChannel('channel', true);

		if (type !== ChannelType.GuildText) {
			const embeds = [
				this.userEmbedError(interaction.member).setDescription('The specified channel is not a text channel.'),
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

	const containers = configurations.map((config) =>
		this.container((cont) =>
			automaticThreadsContainer({
				container: cont
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(`${bold('Channel')}: ${channelMention(config.channelId)}`),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`${bold('Managers')}: ${config.managers.length > 0 ? config.managers.map((id) => roleMention(id)).join(', ') : 'None'}`,
						),
					)
					.addTextDisplayComponents(new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)))
					.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
				description: config.openingMessageDescription,
				member: interaction.member,
				title: config.openingMessageTitle,
			}),
		),
	);

	const pagination = messageWithPagination({
		previous: { customId: this.customId('ticket_automatic_threads_view_previous', page), disabled: page === 0 },
		next: {
			customId: this.customId('ticket_automatic_threads_view_next', page),
			disabled: configurations.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({ components: [...containers, ...pagination], flags: [MessageFlags.IsComponentsV2] });
}

function openingMessageModal(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat'> | Component.Context<'string'>,
	options: { id: string; title?: string; description?: string },
) {
	const titleInput = new LabelBuilder()
		.setLabel('Message Title')
		.setDescription('Write "{member}" to mention the user.')
		.setTextInputComponent(
			(options.title ? new TextInputBuilder().setValue(options.title) : new TextInputBuilder())
				.setCustomId(this.customId('title'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(100)
				.setStyle(TextInputStyle.Short),
		);

	const descriptionInput = new LabelBuilder()
		.setLabel('Message Description')
		.setDescription('Write "{member}" to mention the user.')
		.setTextInputComponent(
			(options.description ? new TextInputBuilder().setValue(options.description) : new TextInputBuilder())
				.setCustomId(this.customId('description'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(500)
				.setStyle(TextInputStyle.Paragraph),
		);

	const modal = new ModalBuilder()
		.setCustomId(this.customId('ticket_automatic_threads_configuration_opening_message', options.id))
		.setTitle('Opening Message Title & Description')
		.setLabelComponents(titleInput, descriptionInput);

	return interaction.showModal(modal).catch(() => false);
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
					embeds: [
						super.userEmbedError(context.interaction.member).setDescription('The subcommand could not be found.'),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferReply()
	private configurationOverview(context: Command.Context<'chat'>) {
		void getConfigurations.call(this, context);
	}

	@IsTextChannel
	private createConfiguration(context: Command.Context<'chat'>) {
		void openingMessageModal.call(this, context, { id: context.interaction.options.getChannel('channel', true).id });
	}

	@DeferReply()
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
					super
						.userEmbedError(interaction.member)
						.setDescription(
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

		return interaction.editReply({ components: [row], content: channel.toString() });
	}

	@DeferReply()
	@IsTextChannel
	private async deleteConfiguration({ interaction }: Command.Context<'chat'>) {
		const channel = interaction.options.getChannel('channel', true);
		await database
			.delete(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.channelId, channel.id));

		return interaction.editReply({
			embeds: [
				super
					.userEmbed(interaction.member)
					.setTitle('Deleted an Automatic Threads Configuration')
					.setDescription(
						`${interaction.member.toString()} deleted an automatic threads configuration in the channel ${channel.toString()} if one existed.`,
					),
			],
		});
	}
}
export class ConfigurationMenuInteraction extends Component.Interaction {
	public readonly customIds = [super.dynamicCustomId('ticket_automatic_threads_configuration_menu')];

	public execute(context: Component.Context<'string'>) {
		switch (context.interaction.values.at(0)) {
			case 'message_title_description': {
				return this.openingMessage(context);
			}
			case 'managers': {
				const { dynamicValue } = super.extractCustomId(context.interaction.customId, true);
				const managersMenu = new RoleSelectMenuBuilder()
					.setCustomId(super.customId('ticket_automatic_threads_configuration_managers', dynamicValue))
					.setMinValues(0)
					.setMaxValues(10)
					.setPlaceholder('Choose the managers of the automatic threads.');

				const row = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(managersMenu);

				return context.interaction.reply({ components: [row] });
			}
			default: {
				return context.interaction.reply({
					embeds: [
						super.userEmbedError(context.interaction.member).setDescription('The selected value could not be found.'),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	private async openingMessage(context: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(context.interaction.customId, true);
		const {
			data: id,
			error,
			success,
		} = automaticThreadsConfigurationsSelectSchema.shape.channelId.safeParse(dynamicValue);

		if (!success) {
			return context.interaction
				.reply({
					embeds: [super.userEmbedError(context.interaction.member).setDescription(prettifyError(error))],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		const [row] = await database
			.select({
				title: automaticThreadsConfigurations.openingMessageTitle,
				description: automaticThreadsConfigurations.openingMessageDescription,
			})
			.from(automaticThreadsConfigurations)
			.where(
				and(
					eq(automaticThreadsConfigurations.channelId, id),
					eq(automaticThreadsConfigurations.guildId, context.interaction.guildId),
				),
			);

		if (!row) {
			return context.interaction
				.reply({
					embeds: [
						super
							.userEmbedError(context.interaction.member)
							.setDescription('No automatic threads configuration for the channel could be found.'),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		const { description, title } = row;

		void openingMessageModal.call(this, context, { description, id, title });
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_automatic_threads_configuration_managers'),
		super.dynamicCustomId('ticket_automatic_threads_view_previous'),
		super.dynamicCustomId('ticket_automatic_threads_view_next'),
	];

	public execute({ interaction }: Component.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.dynamicCustomId('ticket_automatic_threads_configuration_managers'): {
				return interaction.isRoleSelectMenu() && void this.updateManagers({ interaction });
			}
			case super.dynamicCustomId('ticket_automatic_threads_view_previous'):
			case super.dynamicCustomId('ticket_automatic_threads_view_next'): {
				if (interaction.isButton()) {
					void this.configurationOverview({ interaction });
				}

				break;
			}
			default: {
				return interaction.reply({
					embeds: [
						super.userEmbedError(interaction.member).setDescription('The select menu custom ID could not be found.'),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferUpdate
	private async updateManagers({ interaction }: Component.Context<'role'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const managers = interaction.roles.map((role) => role.id);

		await database
			.update(automaticThreadsConfigurations)
			.set({ managers })
			.where(
				and(
					eq(automaticThreadsConfigurations.channelId, dynamicValue),
					eq(automaticThreadsConfigurations.guildId, interaction.guildId),
				),
			);

		const roles = managers.map((id) => roleMention(id)).join(', ');
		const embed = super
			.userEmbed(interaction.member)
			.setTitle('Updated the Automatic Threads Managers')
			.setDescription(
				`${interaction.member.toString()} updated the managers of the automatic threads in ${channelMention(dynamicValue)} to: ${
					managers.length > 0 ? roles : 'none'
				}.`,
			);

		return interaction.editReply({ embeds: [embed], components: [] });
	}

	@DeferUpdate
	private configurationOverview(context: Component.Context<'button'>) {
		const { success, error, page } = goToPage.call(this, context.interaction);

		if (!success) {
			return context.interaction.editReply({
				components: [],
				embeds: [super.userEmbedError(context.interaction.member).setDescription(error)],
			});
		}

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
						super.userEmbedError(context.interaction.member).setDescription('The modal custom ID could not be found.'),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferReply()
	private async createConfigurationOrUpdateOpeningMessage({ interaction }: Modal.Context) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const channel = await fetchChannel(interaction.guild, dynamicValue);

		if (channel?.type !== ChannelType.GuildText) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription('The channel is not a text channel.')],
			});
		}

		const { data, error, success } = automaticThreadsConfigurationsInsertSchema
			.pick({ openingMessageDescription: true, openingMessageTitle: true })
			.safeParse({
				openingMessageDescription: interaction.fields.getTextInputValue('description'),
				openingMessageTitle: interaction.fields.getTextInputValue('title'),
			});

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(prettifyError(error))],
			});
		}

		await database
			.insert(automaticThreadsConfigurations)
			.values({
				channelId: channel.id,
				guildId: interaction.guildId,
				openingMessageTitle: data.openingMessageTitle,
				openingMessageDescription: data.openingMessageDescription,
			})
			.onDuplicateKeyUpdate({
				set: {
					openingMessageTitle: data.openingMessageTitle,
					openingMessageDescription: data.openingMessageDescription,
				},
			});

		return interaction.editReply({
			components: [
				super.container((cont) =>
					cont
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								heading('Created/Updated an Automatic Threads Configuration', HeadingLevel.One),
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${interaction.member.toString()} created or updated an automatic threads configuration in ${channel.toString()}. An example opening message can be seen in the container below.`,
							),
						),
				),
				super.container(
					automaticThreadsContainer({
						description: data.openingMessageDescription,
						member: interaction.member,
						title: data.openingMessageTitle,
					}),
				),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
	}
}
