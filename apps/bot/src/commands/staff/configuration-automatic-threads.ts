import {
	and,
	automaticThreadsConfigurations,
	automaticThreadsConfigurationsInsertSchema,
	automaticThreadsConfigurationsSelectSchema,
	database,
	desc,
	eq,
} from '@ticketer/database';
import {
	Command,
	Component,
	container,
	customId,
	DeferReply,
	DeferUpdate,
	dynamicCustomId,
	extractCustomId,
	Modal,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	bold,
	ChannelType,
	channelMention,
	HeadingLevel,
	heading,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	PermissionFlagsBits,
	RoleSelectMenuBuilder,
	roleMention,
	SeparatorBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { prettifyError } from 'zod';
import { automaticThreadsContainer, fetchChannel, goToPage, messageWithPagination, withPagination } from '@/utils';

function IsTextChannel(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = function (this: Command.Interaction, { interaction }: Command.Context<'chat'>) {
		const { type } = interaction.options.getChannel('channel', true);

		if (type !== ChannelType.GuildText) {
			const embeds = [
				userEmbedError({
					client: interaction.client,
					description: 'The specified channel is not a text channel.',
					member: interaction.member,
				}),
			];

			return interaction.deferred ? interaction.editReply({ embeds }) : interaction.reply({ embeds });
		}

		// biome-ignore lint/complexity/noArguments: It is convenient.
		return Reflect.apply(original, this, arguments) as () => unknown;
	};

	return descriptor;
}

async function getConfigurations({ interaction }: Command.Context<'chat'> | Component.Context<'button'>, page = 0) {
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
		container({
			builder: (cont) =>
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
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)),
						)
						.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
					description: config.openingMessageDescription,
					member: interaction.member,
					title: config.openingMessageTitle,
				}),
			client: interaction.client,
		}),
	);

	const pagination = messageWithPagination({
		previous: { customId: customId('ticket_automatic_threads_view_previous', page), disabled: page === 0 },
		next: {
			customId: customId('ticket_automatic_threads_view_next', page),
			disabled: configurations.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({ components: [...containers, ...pagination], flags: [MessageFlags.IsComponentsV2] });
}

function openingMessageModal(
	{ interaction }: Command.Context<'chat'> | Component.Context<'string'>,
	options: { id: string; title?: string; description?: string },
) {
	const titleInput = new LabelBuilder()
		.setLabel('Message Title')
		.setDescription('Write "{member}" to mention the user.')
		.setTextInputComponent(
			(options.title ? new TextInputBuilder().setValue(options.title) : new TextInputBuilder())
				.setCustomId(customId('title'))
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
				.setCustomId(customId('description'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(500)
				.setStyle(TextInputStyle.Paragraph),
		);

	const modal = new ModalBuilder()
		.setCustomId(customId('ticket_automatic_threads_configuration_opening_message', options.id))
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
				return this.configurationOverview(context);
			}
			case 'create': {
				return this.createConfiguration(context);
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
						userEmbedError({
							client: context.interaction.client,
							description: 'The subcommand could not be found.',
							member: context.interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferReply()
	private configurationOverview(context: Command.Context<'chat'>) {
		void getConfigurations(context);
	}

	@IsTextChannel
	private createConfiguration(context: Command.Context<'chat'>) {
		void openingMessageModal(context, { id: context.interaction.options.getChannel('channel', true).id });
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
					userEmbedError({
						client: interaction.client,
						description: `The automatic threads configuration for the channel ${channel} could not be found. Please create one instead of editing it.`,
						member: interaction.member,
					}),
				],
			});
		}

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(customId('ticket_automatic_threads_configuration_menu', channel.id))
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
				userEmbed(interaction)
					.setTitle('Deleted an Automatic Threads Configuration')
					.setDescription(
						`${interaction.member} deleted an automatic threads configuration in the channel ${channel} if one existed.`,
					),
			],
		});
	}
}
export class ConfigurationMenuInteraction extends Component.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_automatic_threads_configuration_menu')];

	public execute(context: Component.Context<'string'>) {
		switch (context.interaction.values.at(0)) {
			case 'message_title_description': {
				return this.openingMessage(context);
			}
			case 'managers': {
				const { dynamicValue } = extractCustomId(context.interaction.customId, true);
				const managersMenu = new RoleSelectMenuBuilder()
					.setCustomId(customId('ticket_automatic_threads_configuration_managers', dynamicValue))
					.setMinValues(0)
					.setMaxValues(10)
					.setPlaceholder('Choose the managers of the automatic threads.');

				const row = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(managersMenu);

				return context.interaction.reply({ components: [row] });
			}
			default: {
				return context.interaction.reply({
					embeds: [
						userEmbedError({
							client: context.interaction.client,
							description: 'The selected value could not be found.',
							member: context.interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	private async openingMessage(context: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(context.interaction.customId, true);
		const {
			data: id,
			error,
			success,
		} = automaticThreadsConfigurationsSelectSchema.shape.channelId.safeParse(dynamicValue);

		if (!success) {
			return context.interaction
				.reply({
					embeds: [
						userEmbedError({
							client: context.interaction.client,
							description: prettifyError(error),
							member: context.interaction.member,
						}),
					],
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
						userEmbedError({
							client: context.interaction.client,
							description: 'No automatic threads configuration for the channel could be found.',
							member: context.interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		const { description, title } = row;

		void openingMessageModal(context, { description, id, title });
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_automatic_threads_configuration_managers'),
		dynamicCustomId('ticket_automatic_threads_view_previous'),
		dynamicCustomId('ticket_automatic_threads_view_next'),
	];

	public execute({ interaction }: Component.Context) {
		const { customId: id } = extractCustomId(interaction.customId);

		switch (id) {
			case dynamicCustomId('ticket_automatic_threads_configuration_managers'): {
				return interaction.isRoleSelectMenu() && void this.updateManagers({ interaction });
			}
			case dynamicCustomId('ticket_automatic_threads_view_previous'):
			case dynamicCustomId('ticket_automatic_threads_view_next'): {
				if (interaction.isButton()) {
					void this.configurationOverview({ interaction });
				}

				break;
			}
			default: {
				return interaction.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: 'The select menu custom ID could not be found.',
							member: interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferUpdate
	private async updateManagers({ interaction }: Component.Context<'role'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
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
		const embed = userEmbed(interaction)
			.setTitle('Updated the Automatic Threads Managers')
			.setDescription(
				`${interaction.member} updated the managers of the automatic threads in ${channelMention(dynamicValue)} to: ${
					managers.length > 0 ? roles : 'none'
				}.`,
			);

		return interaction.editReply({ embeds: [embed], components: [] });
	}

	@DeferUpdate
	private configurationOverview(context: Component.Context<'button'>) {
		const { success, error, page } = goToPage(context.interaction);

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

		void getConfigurations(context, page);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_automatic_threads_configuration_opening_message')];

	public execute(context: Modal.Context) {
		const { customId: id } = extractCustomId(context.interaction.customId);

		switch (id) {
			case dynamicCustomId('ticket_automatic_threads_configuration_opening_message'): {
				return this.createConfigurationOrUpdateOpeningMessage(context);
			}
			default: {
				return context.interaction.reply({
					embeds: [
						userEmbedError({
							client: context.interaction.client,
							description: 'The modal custom ID could not be found.',
							member: context.interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferReply()
	private async createConfigurationOrUpdateOpeningMessage({ interaction }: Modal.Context) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const channel = await fetchChannel(interaction.guild, dynamicValue);

		if (channel?.type !== ChannelType.GuildText) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'The channel is not a text channel.',
						member: interaction.member,
					}),
				],
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
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
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
				container({
					builder: (cont) =>
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
					client: interaction.client,
				}),
				container({
					builder: automaticThreadsContainer({
						description: data.openingMessageDescription,
						member: interaction.member,
						title: data.openingMessageTitle,
					}),
					client: interaction.client,
				}),
			],
			flags: [MessageFlags.IsComponentsV2],
		});
	}
}
