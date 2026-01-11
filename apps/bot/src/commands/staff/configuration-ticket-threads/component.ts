import {
	and,
	database,
	eq,
	not,
	ThreadTicketActionsPermissionBitField,
	ticketsThreads,
	ticketThreadsCategories,
	ticketThreadsCategoriesSelectSchema,
} from '@ticketer/database';
import {
	Component,
	customId,
	DeferUpdate,
	dynamicCustomId,
	extractCustomId,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	inlineCode,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	RoleSelectMenuBuilder,
	roleMention,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { prettifyError } from 'zod';
import { goToPage, ThreadTicketing } from '@/utils';
import { categoryFieldsModal, configurationMenu, getCategories, HasGlobalConfiguration } from './helpers';

export default class extends Component.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_threads_category_configuration')];

	public execute({ interaction }: Component.Context<'string'>) {
		const value = interaction.values.at(0);

		switch (value) {
			case 'emoji_title_description': {
				return this.fieldsModalValues({ interaction });
			}
			case 'managers': {
				const { dynamicValue } = extractCustomId(interaction.customId);
				const managersMenu = new RoleSelectMenuBuilder()
					.setCustomId(customId('ticket_threads_category_configuration_managers', dynamicValue))
					.setMinValues(0)
					.setMaxValues(10)
					.setPlaceholder('Choose the ticket managers of this category.');

				const row = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(managersMenu);

				return interaction.update({ components: [row] });
			}
			case 'channel':
			case 'logs_channel': {
				const { dynamicValue } = extractCustomId(interaction.customId);

				const channelMenu = new ChannelSelectMenuBuilder()
					.setCustomId(customId(`ticket_threads_category_configuration_${value}`, dynamicValue))
					.setMinValues(1)
					.setMaxValues(1)
					.setPlaceholder(
						`Choose a channel for ${value === 'channel' ? 'tickets to be created in' : 'logs to be sent in'}.`,
					)
					.setChannelTypes(ChannelType.GuildText);

				const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(channelMenu);

				return interaction.update({ components: [row] });
			}
			case 'message_title_description': {
				return this.messageTitleDescriptionValues({ interaction });
			}
			case 'allowed_author_actions': {
				return this.authorActions({ interaction });
			}
			case 'author_leave_action': {
				return this.authorLeaveAction({ interaction });
			}
			case 'private':
			case 'notification': {
				return this.privateAndNotification({ interaction });
			}
			case 'silent_pings': {
				return this.silentPings({ interaction });
			}
			case 'skip_modals': {
				return this.skipModals({ interaction });
			}
			case 'thread_title': {
				return this.threadTitleValues({ interaction });
			}
			case 'ticket_title_description': {
				return this.ticketTitleDescription({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: 'The selected value could not be found.',
							member: interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	private async fieldsModalValues({ interaction }: Component.Context) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		const [row] = await database
			.select({
				emoji: ticketThreadsCategories.categoryEmoji,
				title: ticketThreadsCategories.categoryTitle,
				description: ticketThreadsCategories.categoryDescription,
			})
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		void categoryFieldsModal({ interaction }, { id: categoryId, ...row });
	}

	private async messageTitleDescriptionValues({ interaction }: Component.Context) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		const [row] = await database
			.select({
				title: ticketThreadsCategories.openingMessageTitle,
				description: ticketThreadsCategories.openingMessageDescription,
			})
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const titleInput = new LabelBuilder()
			.setLabel('Message Title')
			.setDescription('Write "{category}" and "{member}" to mention them.')
			.setTextInputComponent(
				(row.title ? new TextInputBuilder().setValue(row.title) : new TextInputBuilder())
					.setCustomId(customId('title'))
					.setRequired(false)
					.setMinLength(1)
					.setMaxLength(100)
					.setStyle(TextInputStyle.Short),
			);
		const descriptionInput = new LabelBuilder()
			.setLabel('Message Description')
			.setDescription('Write "{category}" and "{member}" to mention them.')
			.setTextInputComponent(
				(row.description ? new TextInputBuilder().setValue(row.description) : new TextInputBuilder())
					.setCustomId(customId('description'))
					.setRequired(false)
					.setMinLength(1)
					.setMaxLength(500)
					.setStyle(TextInputStyle.Paragraph),
			);

		const modal = new ModalBuilder()
			.setCustomId(customId('ticket_threads_category_message', categoryId))
			.setTitle('Opening Message Title, & Description')
			.setLabelComponents(titleInput, descriptionInput);

		return interaction.showModal(modal).catch(() => false);
	}

	private async authorActions({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();
		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const authorPermissions = new ThreadTicketActionsPermissionBitField(row.allowedAuthorActions);
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(customId('ticket_threads_category_configuration_allowed_author_actions', row.id))
			.setMinValues(0)
			.setMaxValues(Object.keys(ThreadTicketActionsPermissionBitField.Flags).length)
			.setPlaceholder('Edit the following ticket author actions:')
			.setOptions(
				new StringSelectMenuOptionBuilder()
					.setEmoji('📝')
					.setLabel('Rename Title')
					.setDescription('Toggle whether ticket authors can rename titles.')
					.setValue('rename_title')
					.setDefault(authorPermissions.has(ThreadTicketActionsPermissionBitField.Flags.RenameTitle)),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🔒')
					.setLabel('Lock')
					.setDescription('Toggle whether ticket authors can lock tickets.')
					.setValue('lock')
					.setDefault(authorPermissions.has(ThreadTicketActionsPermissionBitField.Flags.Lock)),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🗃')
					.setLabel('Close')
					.setDescription('Toggle whether ticket authors can close tickets.')
					.setValue('close')
					.setDefault(authorPermissions.has(ThreadTicketActionsPermissionBitField.Flags.Close)),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🔐')
					.setLabel('Lock & Close')
					.setDescription('Toggle whether ticket authors can lock and close tickets.')
					.setValue('lock_and_close')
					.setDefault(authorPermissions.has(ThreadTicketActionsPermissionBitField.Flags.LockAndClose)),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🗑')
					.setLabel('Delete')
					.setDescription('Toggle whether ticket authors can delete tickets.')
					.setValue('delete')
					.setDefault(authorPermissions.has(ThreadTicketActionsPermissionBitField.Flags.Delete)),
			);

		const rowBuilder = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);

		return interaction.editReply({ components: [rowBuilder] });
	}

	private async authorLeaveAction({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();
		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const actions = new ThreadTicketActionsPermissionBitField(row.authorLeaveAction, false);
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(customId('ticket_threads_category_configuration_author_leave_action', row.id))
			.setMinValues(0)
			.setMaxValues(1)
			.setPlaceholder('Edit one of the following ticket author leave actions:')
			.setOptions(
				new StringSelectMenuOptionBuilder()
					.setEmoji('🔒')
					.setLabel('Lock')
					.setDescription('Toggle whether the ticket will be locked.')
					.setValue('lock')
					.setDefault(actions.has(ThreadTicketActionsPermissionBitField.Flags.Lock)),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🗃')
					.setLabel('Close')
					.setDescription('Toggle whether the ticket well be closed.')
					.setValue('close')
					.setDefault(actions.has(ThreadTicketActionsPermissionBitField.Flags.Close)),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🔐')
					.setLabel('Lock & Close')
					.setDescription('Toggle whether the ticket will be locked and closed.')
					.setValue('lock_and_close')
					.setDefault(actions.has(ThreadTicketActionsPermissionBitField.Flags.LockAndClose)),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🗑')
					.setLabel('Delete')
					.setDescription('Toggle whether the ticket  will be deleted.')
					.setValue('delete')
					.setDefault(actions.has(ThreadTicketActionsPermissionBitField.Flags.Delete)),
			);

		const rowBuilder = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);

		return interaction.editReply({ components: [rowBuilder] });
	}

	private async privateAndNotification({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const type = interaction.values.at(0)?.includes('private') ? 'private threads' : 'thread notification';
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();
		await database
			.update(ticketThreadsCategories)
			.set(
				type === 'private threads'
					? { privateThreads: not(ticketThreadsCategories.privateThreads) }
					: { threadNotifications: not(ticketThreadsCategories.threadNotifications) },
			)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const [row] = await database
			.select({
				privateThreads: ticketThreadsCategories.privateThreads,
				threadNotifications: ticketThreadsCategories.threadNotifications,
			})
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const valueAsBoolean = type === 'private threads' ? row.privateThreads : row.threadNotifications;
		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} has toggled the ${type} option to ${valueAsBoolean ? 'enabled' : 'disabled'}.`,
			);

		interaction.editReply({ components: [], embeds: [embed] });
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}

	private async silentPings({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();
		await database
			.update(ticketThreadsCategories)
			.set({
				silentPings: not(ticketThreadsCategories.silentPings),
			})
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const [row] = await database
			.select({ silentPings: ticketThreadsCategories.silentPings })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} has toggled the silent pings option to ${row.silentPings ? 'enabled' : 'disabled'}.`,
			);

		interaction.editReply({ components: [], embeds: [embed] });
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}

	private async skipModals({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();
		await database
			.update(ticketThreadsCategories)
			.set({
				skipModal: not(ticketThreadsCategories.skipModal),
			})
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const [row] = await database
			.select({ skipModal: ticketThreadsCategories.skipModal })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} has toggled the skip modal option to ${row.skipModal ? 'enabled' : 'disabled'}.`,
			);

		interaction.editReply({ components: [], embeds: [embed] });
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}

	private async threadTitleValues({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		const [row] = await database
			.select({ threadTitle: ticketThreadsCategories.threadTitle })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		const titleInput = new LabelBuilder()
			.setLabel('Thread Title')
			.setDescription('Write "{title}", "{member}", and "{date}" to mention them.')
			.setTextInputComponent(
				(row.threadTitle ? new TextInputBuilder().setValue(row.threadTitle) : new TextInputBuilder())
					.setCustomId(customId('title'))
					.setRequired(false)
					.setMinLength(1)
					.setMaxLength(100)
					.setStyle(TextInputStyle.Short),
			);

		const modal = new ModalBuilder()
			.setCustomId(customId('ticket_threads_category_thread_title', categoryId))
			.setTitle('Created Thread Title')
			.setLabelComponents(titleInput);

		return interaction.showModal(modal).catch(() => false);
	}

	private async ticketTitleDescription({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.deferUpdate();
		await database
			.update(ticketThreadsCategories)
			.set({
				titleAndDescriptionRequired: not(ticketThreadsCategories.titleAndDescriptionRequired),
			})
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const [row] = await database
			.select({ titleAndDescriptionRequired: ticketThreadsCategories.titleAndDescriptionRequired })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} has toggled the ticket title and description option to ${row.titleAndDescriptionRequired ? 'required' : 'optional'}.`,
			);

		interaction.editReply({ components: [], embeds: [embed] });
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}
}

export class Channel extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_threads_category_configuration_channel'),
		dynamicCustomId('ticket_threads_category_configuration_logs_channel'),
	];

	@DeferUpdate
	@HasGlobalConfiguration
	public async execute({ interaction }: Component.Context<'channel'>) {
		const { customId, dynamicValue } = extractCustomId(interaction.customId, true);
		const type = customId.includes('logs') ? 'logs channel' : 'ticket channel';
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		// biome-ignore lint/style/noNonNullAssertion: It should exist.
		const channel = interaction.channels.at(0)!;

		await database
			.update(ticketThreadsCategories)
			.set({
				...(type === 'ticket channel' ? { channelId: channel.id } : { logsChannelId: channel.id }),
			})
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(`${interaction.member} updated the ${type} to ${channel}.`);

		interaction.editReply({ components: [], embeds: [embed] });
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}
}

export class Managers extends Component.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_threads_category_configuration_managers')];

	@DeferUpdate
	@HasGlobalConfiguration
	public async execute({ interaction }: Component.Context<'role'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		const managers = interaction.roles.map((role) => role.id);

		await database
			.update(ticketThreadsCategories)
			.set({ managers })
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const roles = managers.map((id) => roleMention(id)).join(', ');

		interaction.editReply({
			components: [],
			embeds: [
				userEmbed(interaction)
					.setTitle('Updated the Thread Ticket Category')
					.setDescription(
						`${interaction.member} updated the managers of the category to: ${managers.length > 0 ? roles : 'none'}.`,
					),
			],
		});
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}
}

export class AuthorActions extends Component.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_threads_category_configuration_allowed_author_actions')];

	@DeferUpdate
	@HasGlobalConfiguration
	public async execute({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const authorPermissions = new ThreadTicketActionsPermissionBitField(row.allowedAuthorActions);

		for (const [name, flag] of ThreadTicketing.actionsAsKeyAndFlagsMap) {
			interaction.values.includes(name) ? authorPermissions.set(flag) : authorPermissions.clear(flag);
		}

		await authorPermissions.updateAllowedAuthorActions(row.id, row.guildId);

		interaction.editReply({
			components: [],
			embeds: [
				userEmbed(interaction)
					.setTitle('Updated the Thread Ticket Category')
					.setDescription(
						`${interaction.member} has edited the allowed author actions to: ${
							interaction.values.length > 0
								? ThreadTicketing.actionsBitfieldToNames(authorPermissions.permissions)
										.map((name) => inlineCode(name))
										.join(', ')
								: 'None'
						}.`,
					),
			],
		});
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}
}

export class AuthorLeaveAction extends Component.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_threads_category_configuration_author_leave_action')];

	@DeferUpdate
	@HasGlobalConfiguration
	public async execute({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No category with the given ID could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const bit = ThreadTicketing.actionsAsKeyAndFlagsMap.get(interaction.values.at(0) as ThreadTicketing.KeyOfActions);
		await database
			.update(ticketThreadsCategories)
			.set({ authorLeaveAction: bit ?? null })
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		interaction.editReply({
			components: [],
			embeds: [
				userEmbed(interaction)
					.setTitle('Updated the Thread Ticket Category')
					.setDescription(
						`${interaction.member} has edited the author leave action to: ${
							// biome-ignore lint/style/noNonNullAssertion: It should exist.
							bit ? inlineCode(ThreadTicketing.actionsBitfieldToNames(bit).at(0)!) : 'None'
						}.`,
					),
			],
		});
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}
}

export class Delete extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_threads_category_delete_confirm'),
		dynamicCustomId('ticket_threads_category_delete_cancel'),
	];

	@DeferUpdate
	@HasGlobalConfiguration
	public async execute({ interaction }: Component.Context<'button'>) {
		const { customId, dynamicValue } = extractCustomId(interaction.customId, true);
		const confirmDeletion = customId.includes('confirm');
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		// TODO: change to use the RETURNING clause for MariaDB when it gets released.
		const [row] = await database
			.select({ title: ticketThreadsCategories.categoryTitle })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (confirmDeletion) {
			await database
				.delete(ticketsThreads)
				.where(and(eq(ticketsThreads.categoryId, categoryId), eq(ticketsThreads.guildId, interaction.guildId)));
			await database
				.delete(ticketThreadsCategories)
				.where(
					and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)),
				);
		}

		interaction.editReply({
			components: [],
			embeds: [
				userEmbed(interaction)
					.setTitle(confirmDeletion ? 'Deleted the Category' : 'Deletion Cancelled')
					.setDescription(
						confirmDeletion
							? `${interaction.member} deleted the ${row?.title ? inlineCode(row.title) : 'No Title Found'} category.`
							: `The deletion of the category ${row?.title ? inlineCode(row.title) : 'No Title Found'} has been cancelled.`,
					),
			],
		});
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message.embeds });
	}
}

export class Overview extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_threads_category_view_previous'),
		dynamicCustomId('ticket_threads_category_view_next'),
	];

	@DeferUpdate
	@HasGlobalConfiguration
	public execute({ interaction }: Component.Context<'button'>) {
		const { success, error, page } = goToPage(interaction);

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [userEmbedError({ client: interaction.client, description: error, member: interaction.member })],
			});
		}

		void getCategories({ interaction }, page);
	}
}
