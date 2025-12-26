import {
	and,
	database,
	eq,
	ThreadTicketActionsPermissionBitField,
	ticketsThreads,
	ticketThreadsCategories,
	ticketThreadsCategoriesSelectSchema,
} from '@ticketer/database';
import {
	Command,
	Component,
	customId,
	DeferReply,
	dynamicCustomId,
	extractCustomId,
	Modal,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import { ChannelType, Colors, MessageFlags, PermissionFlagsBits, type Snowflake } from 'discord.js';
import { prettifyError, z } from 'zod';
import { getTranslations, translate } from '@/i18n';
import { fetchChannel, ThreadTicketing } from '@/utils';

const dataTranslations = translate().commands.ticket.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.ticket.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.ticket.data.description'));

	public async execute({ interaction }: Command.Context) {
		const categories = await ThreadTicketing.categoryList({ guildId: interaction.guildId });

		if (categories.length === 0) {
			const translations = translate(interaction.locale).tickets.threads.categories.createTicket.errors.noCategories;

			return interaction
				.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: translations.description(),
							member: interaction.member,
							title: translations.title(),
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		if (categories.length === 1) {
			// biome-ignore lint/style/noNonNullAssertion: It should exist.
			const { id, skipModal, titleAndDescriptionRequired } = categories.at(0)!;

			if (skipModal) {
				return ThreadTicketing.createTicket({ interaction }, { categoryId: id });
			}

			void interaction
				.showModal(
					ThreadTicketing.ticketModal({
						categoryId: id,
						locale: interaction.locale,
						titleAndDescriptionRequired,
					}),
				)
				.catch(() => false);
		} else {
			return interaction
				.reply({
					components: [
						ThreadTicketing.categoryListSelectMenuRow({
							categories,
							customId: customId('ticket_threads_categories_create_list'),
							locale: interaction.locale,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}
	}
}

export class TicketButtonsInteraction extends Component.Interaction {
	public readonly customIds = [
		customId('ticket_threads_category_create_lock'),
		customId('ticket_threads_category_create_close'),
		customId('ticket_threads_category_create_lock_and_close'),
		customId('ticket_threads_category_create_delete'),
	];

	@DeferReply({ ephemeral: true })
	public execute(context: Component.Context) {
		const { customId: id } = extractCustomId(context.interaction.customId);

		switch (id) {
			case customId('ticket_threads_category_create_lock_and_close'):
			case customId('ticket_threads_category_create_lock'): {
				return ThreadTicketing.lockTicket(context, context.interaction.customId.includes('lock_and_close'));
			}
			case customId('ticket_threads_category_create_close'): {
				return ThreadTicketing.closeTicket(context);
			}
			case customId('ticket_threads_category_create_delete'): {
				return ThreadTicketing.deleteTicket(context);
			}
			default: {
				const translations = translate(context.interaction.locale).tickets.threads.categories.createModal.errors
					.invalidCustomId;

				return context.interaction.editReply({
					embeds: [
						userEmbedError({
							client: context.interaction.client,
							description: translations.description(),
							member: context.interaction.member,
							title: translations.title(),
						}),
					],
				});
			}
		}
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		customId('ticket_threads_categories_create_list'),
		dynamicCustomId('ticket_threads_categories_create_list_proxy'),
		customId('ticket_threads_categories_create_list_panel'),
		customId('ticket_threads_category_create_rename_title'),
	];

	public execute(context: Component.Context) {
		const { customId: id, dynamicValue } = extractCustomId(context.interaction.customId);

		switch (id) {
			case customId('ticket_threads_categories_create_list'):
			case dynamicCustomId('ticket_threads_categories_create_list_proxy'): {
				if (context.interaction.isStringSelectMenu()) {
					return void this.ticketModal({ interaction: context.interaction }, dynamicValue);
				}

				break;
			}
			case customId('ticket_threads_categories_create_list_panel'): {
				return context.interaction.isButton() && void this.panelTicket(context);
			}
			case customId('ticket_threads_category_create_rename_title'): {
				return void ThreadTicketing.renameTitleModal(context);
			}
			default: {
				const translations = translate(context.interaction.locale).tickets.threads.categories.createModal.errors
					.invalidCustomId;

				return context.interaction.reply({
					embeds: [
						userEmbedError({
							client: context.interaction.client,
							description: translations.description(),
							member: context.interaction.member,
							title: translations.title(),
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	private async ticketModal({ interaction }: Component.Context<'string'>, proxiedUserId?: Snowflake) {
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(interaction.values.at(0)));
		const translations = translate(interaction.locale).tickets.threads.categories.createModal.errors.invalidId;

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
						title: translations.title(),
					}),
				],
			});
		}

		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: translations.description(),
						member: interaction.member,
						title: translations.title(),
					}),
				],
			});
		}

		if (row.skipModal) {
			return ThreadTicketing.createTicket({ interaction }, { categoryId: row.id, proxiedUserId });
		}

		void interaction
			.showModal(
				ThreadTicketing.ticketModal({
					categoryId: row.id,
					locale: interaction.locale,
					proxiedUserId,
					titleAndDescriptionRequired: row.titleAndDescriptionRequired,
				}),
			)
			.catch(() => false);
	}

	private async panelTicket({ interaction }: Component.Context) {
		const categories = await ThreadTicketing.categoryList({ guildId: interaction.guildId });

		if (categories.length === 0) {
			const translations = translate(interaction.locale).tickets.threads.categories.createTicket.errors.noCategories;

			return interaction
				.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: translations.description(),
							member: interaction.member,
							title: translations.title(),
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		if (categories.length === 1) {
			// biome-ignore lint/style/noNonNullAssertion: It should exist.
			const { id: categoryId, skipModal, titleAndDescriptionRequired } = categories.at(0)!;

			if (skipModal) {
				return ThreadTicketing.createTicket({ interaction }, { categoryId });
			}

			void interaction
				.showModal(
					ThreadTicketing.ticketModal({
						categoryId,
						locale: interaction.locale,
						titleAndDescriptionRequired,
					}),
				)
				.catch(() => false);
		} else {
			return interaction
				.reply({
					components: [
						ThreadTicketing.categoryListSelectMenuRow({
							categories,
							customId: customId('ticket_threads_categories_create_list'),
							locale: interaction.locale,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_threads_categories_create_ticket'),
		customId('ticket_threads_categories_create_rename_title_modal'),
	];

	public execute({ interaction }: Modal.Context) {
		const { customId: id } = extractCustomId(interaction.customId);

		switch (id) {
			case dynamicCustomId('ticket_threads_categories_create_ticket'): {
				return ThreadTicketing.createTicket({ interaction });
			}
			case customId('ticket_threads_categories_create_rename_title_modal'): {
				return this.renameTitle({ interaction });
			}
			default: {
				const translations = translate(interaction.locale).tickets.threads.categories.createModal.errors
					.invalidCustomId;

				return interaction.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: translations.description(),
							member: interaction.member,
							title: translations.title(),
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	@DeferReply({ ephemeral: true })
	private async renameTitle({ interaction }: Modal.Context) {
		const { channel, client, fields, guild, guildLocale, locale, member } = interaction;
		const translations = translate(locale).tickets.threads.categories.actions;

		if (channel?.type !== ChannelType.PrivateThread && channel?.type !== ChannelType.PublicThread) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client,
						description: translations._errorIfNotTicketChannel.description(),
						member,
						title: translations._errorIfNotTicketChannel.title(),
					}),
				],
			});
		}

		if (!channel.editable) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client,
						description: translations.renameTitle.modal.errors.notEditable.description(),
						member,
						title: translations.renameTitle.modal.errors.notEditable.title(),
					}),
				],
			});
		}

		const [row] = await database
			.select({
				allowedAuthorActions: ticketThreadsCategories.allowedAuthorActions,
				authorId: ticketsThreads.authorId,
				logsChannelId: ticketThreadsCategories.logsChannelId,
				managers: ticketThreadsCategories.managers,
			})
			.from(ticketsThreads)
			.where(eq(ticketsThreads.threadId, channel.id))
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));

		if (!row?.managers.some((id) => member.roles.resolve(id))) {
			if (row?.authorId !== member.id) {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client,
							description: translations._errorIfNotTicketAuthorOrManager.description(),
							member,
							title: translations._errorIfNotTicketAuthorOrManager.title(),
						}),
					],
				});
			}

			const authorPermissions = new ThreadTicketActionsPermissionBitField(row.allowedAuthorActions);

			if (!authorPermissions.has(ThreadTicketActionsPermissionBitField.Flags.RenameTitle)) {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client,
							description: translations._errorIfNoAuthorPermissions.description(),
							member,
							title: translations._errorIfNoAuthorPermissions.title(),
						}),
					],
				});
			}
		}

		const oldTitle = channel.name;
		const { data: newTitle, success } = z.string().min(1).max(100).safeParse(fields.getTextInputValue('title'));

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client,
						description: translations.renameTitle.modal.errors.tooLong.description(),
						member,
						title: translations.renameTitle.modal.errors.tooLong.title(),
					}),
				],
			});
		}

		const successTranslations = translations.renameTitle.modal.success;
		const guildSuccessTranslations =
			translate(guildLocale).tickets.threads.categories.actions.renameTitle.modal.success;
		const embed = userEmbed({ client, member })
			.setColor(Colors.DarkGreen)
			.setTitle(successTranslations.title())
			.setDescription(successTranslations.user.description({ oldTitle, newTitle }));

		await channel.edit({ name: newTitle });
		await interaction.editReply({
			embeds: [embed],
		});

		if (row.logsChannelId) {
			const me = await guild.members.fetchMe();
			const logsChannel = await fetchChannel(guild, row.logsChannelId);

			if (!logsChannel?.isTextBased()) return;
			if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]))
				return;

			void logsChannel.send({
				embeds: [
					embed
						.setTitle(guildSuccessTranslations.title())
						.setDescription(
							guildSuccessTranslations.logs.description({ oldTitle, newTitle, thread: channel.toString() }),
						),
				],
			});
		}
	}
}
