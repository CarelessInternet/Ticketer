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
	DeferReply,
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
import { categoryFieldsModal, getCategories, HasGlobalConfiguration } from './helpers';

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

				return interaction.reply({ components: [row] });
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

				return interaction.reply({ components: [row] });
			}
			case 'message_title_description': {
				return this.messageTitleDescriptionValues({ interaction });
			}
			case 'allowed_author_actions': {
				const { dynamicValue } = extractCustomId(interaction.customId);

				const selectMenu = new StringSelectMenuBuilder()
					.setCustomId(customId('ticket_threads_category_configuration_allowed_author_actions', dynamicValue))
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
					embeds: [userEmbedError({ ...interaction, description: 'The selected value could not be found.' })],
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
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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
				embeds: [userEmbedError({ ...interaction, description: 'No category with the given ID could be found.' })],
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
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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
				embeds: [userEmbedError({ ...interaction, description: 'No category with the given ID could be found.' })],
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

	@DeferReply()
	private async privateAndNotification({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const type = interaction.values.at(0)?.includes('private') ? 'private threads' : 'thread notification';
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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
				embeds: [userEmbedError({ ...interaction, description: 'No category with the given ID could be found.' })],
			});
		}

		const valueAsBoolean = type === 'private threads' ? row.privateThreads : row.threadNotifications;
		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} has toggled the ${type} option to ${valueAsBoolean ? 'enabled' : 'disabled'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}

	@DeferReply()
	private async silentPings({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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
				embeds: [userEmbedError({ ...interaction, description: 'No category with the given ID could be found.' })],
			});
		}

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} has toggled the silent pings option to ${row.silentPings ? 'enabled' : 'disabled'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}

	@DeferReply()
	private async skipModals({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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
				embeds: [userEmbedError({ ...interaction, description: 'No category with the given ID could be found.' })],
			});
		}

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} has toggled the skip modal option to ${row.skipModal ? 'enabled' : 'disabled'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
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
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
			});
		}

		const [row] = await database
			.select({ threadTitle: ticketThreadsCategories.threadTitle })
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.reply({
				embeds: [userEmbedError({ ...interaction, description: 'No category with the given ID could be found.' })],
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

	@DeferReply()
	private async ticketTitleDescription({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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
				embeds: [userEmbedError({ ...interaction, description: 'No category with the given ID could be found.' })],
			});
		}

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} has toggled the ticket title and description option to ${row.titleAndDescriptionRequired ? 'required' : 'optional'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}
}

export class OtherComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_threads_category_configuration_channel'),
		dynamicCustomId('ticket_threads_category_configuration_logs_channel'),
		dynamicCustomId('ticket_threads_category_configuration_managers'),
		dynamicCustomId('ticket_threads_category_configuration_allowed_author_actions'),
		dynamicCustomId('ticket_threads_category_delete_confirm'),
		dynamicCustomId('ticket_threads_category_delete_cancel'),
		dynamicCustomId('ticket_threads_category_view_previous'),
		dynamicCustomId('ticket_threads_category_view_next'),
	];

	@HasGlobalConfiguration
	public execute({ interaction }: Component.Context) {
		const { customId: id } = extractCustomId(interaction.customId);

		switch (id) {
			case dynamicCustomId('ticket_threads_category_configuration_channel'):
			case dynamicCustomId('ticket_threads_category_configuration_logs_channel'): {
				return interaction.isChannelSelectMenu() && void this.categoryChannel({ interaction });
			}
			case dynamicCustomId('ticket_threads_category_configuration_managers'): {
				return interaction.isRoleSelectMenu() && void this.categoryManagers({ interaction });
			}
			case dynamicCustomId('ticket_threads_category_configuration_allowed_author_actions'): {
				return interaction.isStringSelectMenu() && void this.allowedAuthorActions({ interaction });
			}
			case dynamicCustomId('ticket_threads_category_delete_confirm'):
			case dynamicCustomId('ticket_threads_category_delete_cancel'): {
				return interaction.isButton() && void this.confirmDeleteCategory({ interaction });
			}
			case dynamicCustomId('ticket_threads_category_view_previous'):
			case dynamicCustomId('ticket_threads_category_view_next'): {
				if (interaction.isButton()) {
					void this.categoryView({ interaction });
				}

				break;
			}
			default: {
				return interaction.reply({
					embeds: [userEmbedError({ ...interaction, description: 'The component ID could not be found.' })],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferUpdate
	private async categoryChannel({ interaction }: Component.Context<'channel'>) {
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
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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

		return interaction.editReply({ components: [], embeds: [embed] });
	}

	@DeferUpdate
	private async categoryManagers({ interaction }: Component.Context<'role'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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
				userEmbed(interaction)
					.setTitle('Updated the Thread Ticket Category')
					.setDescription(
						`${interaction.member} updated the managers of the category to: ${managers.length > 0 ? roles : 'none'}.`,
					),
			],
		});
	}

	@DeferUpdate
	private async allowedAuthorActions({ interaction }: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
			});
		}

		const value = interaction.values.at(0);

		if (!value) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: 'The selected value could not be found.' })],
			});
		}

		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: 'No category with the given ID could be found.' })],
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
				userEmbed(interaction)
					.setTitle('Updated the Thread Ticket Category')
					.setDescription(
						`${interaction.member} has toggled the ${inlineCode(ThreadTicketing.ActionsAsName[value as ThreadTicketing.KeyOfActions])} ticket author action to ${enabled ? 'enabled' : 'disabled'}.`,
					),
			],
		});
	}

	@DeferUpdate
	private async confirmDeleteCategory({ interaction }: Component.Context<'button'>) {
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
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
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
				userEmbed(interaction)
					.setTitle(confirmDeletion ? 'Deleted the Category' : 'Deletion Cancelled')
					.setDescription(
						confirmDeletion
							? `${interaction.member} deleted the ${row?.title ? inlineCode(row.title) : 'No Title Found'} category.`
							: `The deletion of the category ${row?.title ? inlineCode(row.title) : 'No Title Found'} has been cancelled.`,
					),
			],
		});
	}

	@DeferUpdate
	private categoryView({ interaction }: Component.Context<'button'>) {
		const { success, error, page } = goToPage(interaction);

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [userEmbedError({ ...interaction, description: error })],
			});
		}

		void getCategories({ interaction }, page);
	}
}
