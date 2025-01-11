import {
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	MessageFlags,
	ModalBuilder,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
	inlineCode,
	roleMention,
} from 'discord.js';
import { Component, DeferReply, DeferUpdate } from '@ticketer/djs-framework';
import { HasGlobalConfiguration, categoryFieldsModal, getCategories } from './helpers';
import {
	ThreadTicketActionsPermissionBitField,
	and,
	database,
	eq,
	not,
	ticketThreadsCategories,
	ticketThreadsCategoriesSelectSchema,
	ticketsThreads,
} from '@ticketer/database';
import { ThreadTicketing, goToPage, zodErrorToString } from '@/utils';

export default class extends Component.Interaction {
	public readonly customIds = [super.dynamicCustomId('ticket_threads_category_configuration')];

	public execute({ interaction }: Component.Context<'string'>) {
		const value = interaction.values.at(0);

		switch (value) {
			case 'emoji_title_description': {
				return this.fieldsModalValues({ interaction });
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

				const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(channelMenu);

				return interaction.reply({ components: [row] });
			}
			case 'message_title_description': {
				return this.messageTitleDescriptionValues({ interaction });
			}
			case 'allowed_author_actions': {
				const { dynamicValue } = super.extractCustomId(interaction.customId);

				const selectMenu = new StringSelectMenuBuilder()
					.setCustomId(super.customId('ticket_threads_category_configuration_allowed_author_actions', dynamicValue))
					.setMinValues(1)
					.setMaxValues(1)
					.setPlaceholder('Edit one of the following ticket author actions:')
					.setOptions(
						new StringSelectMenuOptionBuilder()
							.setEmoji('📝')
							.setLabel('Rename Title')
							.setDescription('Toggle whether ticket authors can rename titles.')
							.setValue('rename_title'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('🔒')
							.setLabel('Lock')
							.setDescription('Toggle whether ticket authors can lock tickets.')
							.setValue('lock'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('🗃')
							.setLabel('Close')
							.setDescription('Toggle whether ticket authors can close tickets.')
							.setValue('close'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('🔐')
							.setLabel('Lock & Close')
							.setDescription('Toggle whether ticket authors can lock and close tickets.')
							.setValue('lock_and_close'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('🗑')
							.setLabel('Delete')
							.setDescription('Toggle whether ticket authors can delete tickets.')
							.setValue('delete'),
					);

				const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);

				return interaction.reply({ components: [row] });
			}
			case 'private':
			case 'notification': {
				return this.privateAndNotification({ interaction });
			}
			case 'silent_pings': {
				return this.silentPings({ interaction });
			}
			case 'ticket_title_description': {
				return this.ticketTitleDescription({ interaction });
			}
			case 'skip_modals': {
				return this.skipModals({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.member).setDescription('The selected value could not be found.')],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	private async fieldsModalValues({ interaction }: Component.Context) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
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
					super.userEmbedError(interaction.member).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		void categoryFieldsModal.call(this, { interaction }, { id: categoryId, ...row });
	}

	private async messageTitleDescriptionValues({ interaction }: Component.Context) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.reply({
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
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
					super.userEmbedError(interaction.member).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		const titleInput = (row.title ? new TextInputBuilder().setValue(row.title) : new TextInputBuilder())
			.setCustomId(super.customId('title'))
			.setLabel('Message Title')
			.setRequired(false)
			.setMinLength(1)
			.setMaxLength(100)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Write "{category}" and "{member}" to mention them.');
		const descriptionInput = (
			row.description ? new TextInputBuilder().setValue(row.description) : new TextInputBuilder()
		)
			.setCustomId(super.customId('description'))
			.setLabel('Message Description')
			.setRequired(false)
			.setMinLength(1)
			.setMaxLength(500)
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('Write "{category}" and "{member}" to mention them.');

		const row1 = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
		const row2 = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionInput);

		const modal = new ModalBuilder()
			.setCustomId(super.customId('ticket_threads_category_message', categoryId))
			.setTitle('Opening Message Title, & Description')
			.setComponents(row1, row2);

		return interaction.showModal(modal).catch(() => false);
	}

	@DeferReply()
	private async privateAndNotification({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const type = interaction.values.at(0)?.includes('private') ? 'private threads' : 'thread notification';
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
			});
		}

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
					super.userEmbedError(interaction.member).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		const valueAsBoolean = type === 'private threads' ? row.privateThreads : row.threadNotifications;
		const embed = super
			.userEmbed(interaction.member)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member.toString()} has toggled the ${type} option to ${valueAsBoolean ? 'enabled' : 'disabled'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}

	@DeferReply()
	private async silentPings({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
			});
		}

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
					super.userEmbedError(interaction.member).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		const embed = super
			.userEmbed(interaction.member)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member.toString()} has toggled the silent pings option to ${row.silentPings ? 'enabled' : 'disabled'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}

	@DeferReply()
	private async ticketTitleDescription({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
			});
		}

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
					super.userEmbedError(interaction.member).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		const embed = super
			.userEmbed(interaction.member)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member.toString()} has toggled the ticket title and description option to ${row.titleAndDescriptionRequired ? 'required' : 'optional'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}

	@DeferReply()
	private async skipModals({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
			});
		}

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
					super.userEmbedError(interaction.member).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		const embed = super
			.userEmbed(interaction.member)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member.toString()} has toggled the skip modal option to ${row.skipModal ? 'enabled' : 'disabled'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}
}

export class OtherComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_threads_category_configuration_channel'),
		super.dynamicCustomId('ticket_threads_category_configuration_logs_channel'),
		super.dynamicCustomId('ticket_threads_category_configuration_managers'),
		super.dynamicCustomId('ticket_threads_category_configuration_allowed_author_actions'),
		super.dynamicCustomId('ticket_threads_category_delete_confirm'),
		super.dynamicCustomId('ticket_threads_category_delete_cancel'),
		super.dynamicCustomId('ticket_threads_category_view_previous'),
		super.dynamicCustomId('ticket_threads_category_view_next'),
	];

	@HasGlobalConfiguration
	public execute({ interaction }: Component.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.dynamicCustomId('ticket_threads_category_configuration_channel'):
			case super.dynamicCustomId('ticket_threads_category_configuration_logs_channel'): {
				return interaction.isChannelSelectMenu() && this.categoryChannel({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_configuration_managers'): {
				return interaction.isRoleSelectMenu() && this.categoryManagers({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_configuration_allowed_author_actions'): {
				return interaction.isStringSelectMenu() && this.allowedAuthorActions({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_delete_confirm'):
			case super.dynamicCustomId('ticket_threads_category_delete_cancel'): {
				return interaction.isButton() && this.confirmDeleteCategory({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_view_previous'):
			case super.dynamicCustomId('ticket_threads_category_view_next'): {
				if (interaction.isButton()) {
					void this.categoryView({ interaction });
				}

				break;
			}
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.member).setDescription('The component ID could not be found.')],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferUpdate
	private async categoryChannel({ interaction }: Component.Context<'channel'>) {
		const { customId, dynamicValue } = super.extractCustomId(interaction.customId, true);
		const type = customId.includes('logs') ? 'logs channel' : 'ticket channel';
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const channel = interaction.channels.at(0)!;

		await database
			.update(ticketThreadsCategories)
			.set({
				...(type === 'ticket channel' ? { channelId: channel.id } : { logsChannelId: channel.id }),
			})
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const embed = super
			.userEmbed(interaction.member)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(`${interaction.member.toString()} updated the ${type} to ${channel.toString()}.`);

		return interaction.editReply({ components: [], embeds: [embed] });
	}

	@DeferUpdate
	private async categoryManagers({ interaction }: Component.Context<'role'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
			});
		}

		const managers = interaction.roles.map((role) => role.id);

		await database
			.update(ticketThreadsCategories)
			.set({ managers })
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const roles = managers.map((id) => roleMention(id)).join(', ');

		return interaction.editReply({
			components: [],
			embeds: [
				super
					.userEmbed(interaction.member)
					.setTitle('Updated the Thread Ticket Category')
					.setDescription(
						`${interaction.member.toString()} updated the managers of the category to: ${
							managers.length > 0 ? roles : 'none'
						}.`,
					),
			],
		});
	}

	@DeferUpdate
	private async allowedAuthorActions({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
			});
		}

		const value = interaction.values.at(0);

		if (!value) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription('The selected value could not be found.')],
			});
		}

		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [
					super.userEmbedError(interaction.member).setDescription('No category with the given ID could be found.'),
				],
			});
		}

		const authorPermissions = new ThreadTicketActionsPermissionBitField(row.allowedAuthorActions);
		let enabled = false;

		for (const [name, flag] of ThreadTicketing.actionsAsKeyAndFlagsMap) {
			if (value === name) {
				enabled = authorPermissions.toggle(flag);
				break;
			}
		}

		await authorPermissions.updateAuthorPermissions(row.id, row.guildId);

		return interaction.editReply({
			embeds: [
				super
					.userEmbed(interaction.member)
					.setTitle('Updated the Thread Ticket Category')
					.setDescription(
						`${interaction.member.toString()} has toggled the ${inlineCode(ThreadTicketing.ActionsAsName[value as ThreadTicketing.KeyOfActions])} ticket author action to ${enabled ? 'enabled' : 'disabled'}.`,
					),
			],
		});
	}

	@DeferUpdate
	private async confirmDeleteCategory({ interaction }: Component.Context<'button'>) {
		const { customId, dynamicValue } = super.extractCustomId(interaction.customId, true);
		const confirmDeletion = customId.includes('confirm');
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [super.userEmbedError(interaction.member).setDescription(zodErrorToString(error))],
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

		return interaction.editReply({
			components: [],
			embeds: [
				super
					.userEmbed(interaction.member)
					.setTitle(confirmDeletion ? 'Deleted the Category' : 'Deletion Cancelled')
					.setDescription(
						confirmDeletion
							? `${interaction.member.toString()} deleted the ${row?.title ? inlineCode(row.title) : 'No Title Found'} category.`
							: `The deletion of the category ${row?.title ? inlineCode(row.title) : 'No Title Found'} has been cancelled.`,
					),
			],
		});
	}

	@DeferUpdate
	private categoryView({ interaction }: Component.Context<'button'>) {
		const { success, error, page } = goToPage.call(this, interaction);

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [super.userEmbedError(interaction.member).setDescription(error)],
			});
		}

		void getCategories.call(this, { interaction }, page);
	}
}
