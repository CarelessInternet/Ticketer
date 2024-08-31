import { ChannelType, Colors, PermissionFlagsBits, type Snowflake } from 'discord.js';
import { Command, Component, DeferReply, Modal } from '@ticketer/djs-framework';
import { ThreadTicketing, zodErrorToString } from '@/utils';
import {
	and,
	database,
	eq,
	ticketThreadsCategories,
	ticketThreadsCategoriesSelectSchema,
	ticketsThreads,
} from '@ticketer/database';
import { getTranslations, translate } from '@/i18n';
import { z } from 'zod';

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
						super.userEmbedError(interaction.user, translations.title()).setDescription(translations.description()),
					],
					ephemeral: true,
				})
				.catch(() => false);
		}

		if (categories.length === 1) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { id, skipModal, titleAndDescriptionRequired } = categories.at(0)!;

			if (skipModal) {
				return ThreadTicketing.createTicket.call(this, { interaction }, { categoryId: id });
			}

			void interaction
				.showModal(
					ThreadTicketing.ticketModal.call(this, {
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
						ThreadTicketing.categoryListSelectMenu({
							categories,
							customId: super.customId('ticket_threads_categories_create_list'),
							locale: interaction.locale,
						}),
					],
					ephemeral: true,
				})
				.catch(() => false);
		}
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.customId('ticket_threads_categories_create_list'),
		super.dynamicCustomId('ticket_threads_categories_create_list_proxy'),
		super.customId('ticket_threads_categories_create_list_panel'),
		super.customId('ticket_threads_category_create_rename_title'),
		super.customId('ticket_threads_category_create_lock'),
		super.customId('ticket_threads_category_create_close'),
		super.customId('ticket_threads_category_create_lock_and_close'),
		super.customId('ticket_threads_category_create_delete'),
	];

	public execute(context: Component.Context) {
		const { customId, dynamicValue } = super.extractCustomId(context.interaction.customId);

		switch (customId) {
			case super.customId('ticket_threads_categories_create_list'):
			case super.dynamicCustomId('ticket_threads_categories_create_list_proxy'): {
				if (context.interaction.isStringSelectMenu()) {
					void this.ticketModal({ interaction: context.interaction }, dynamicValue);
				}

				break;
			}
			case super.customId('ticket_threads_categories_create_list_panel'): {
				return context.interaction.isButton() && this.panelTicket(context);
			}
			case super.customId('ticket_threads_category_create_rename_title'): {
				void ThreadTicketing.renameTitleModal.call(this, context);
				return;
			}
			case super.customId('ticket_threads_category_create_lock_and_close'):
			case super.customId('ticket_threads_category_create_lock'): {
				void this.lockTicket(context);
				return;
			}
			case super.customId('ticket_threads_category_create_close'): {
				void this.closeTicket(context);
				return;
			}
			case super.customId('ticket_threads_category_create_delete'): {
				void this.deleteTicket(context);
				return;
			}
			default: {
				const translations = translate(context.interaction.locale).tickets.threads.categories.createModal.errors
					.invalidCustomId;

				return context.interaction.reply({
					embeds: [
						super
							.userEmbedError(context.interaction.user, translations.title())
							.setDescription(translations.description()),
					],
					ephemeral: true,
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
				embeds: [super.userEmbedError(interaction.user, translations.title()).setDescription(zodErrorToString(error))],
			});
		}

		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.reply({
				embeds: [
					super.userEmbedError(interaction.user, translations.title()).setDescription(translations.description()),
				],
			});
		}

		if (row.skipModal) {
			return ThreadTicketing.createTicket.call(this, { interaction }, { categoryId: row.id, proxiedUserId });
		}

		void interaction
			.showModal(
				ThreadTicketing.ticketModal.call(this, {
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
						super.userEmbedError(interaction.user, translations.title()).setDescription(translations.description()),
					],
					ephemeral: true,
				})
				.catch(() => false);
		}

		if (categories.length === 1) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { id: categoryId, skipModal, titleAndDescriptionRequired } = categories.at(0)!;

			if (skipModal) {
				return ThreadTicketing.createTicket.call(this, { interaction }, { categoryId });
			}

			void interaction
				.showModal(
					ThreadTicketing.ticketModal.call(this, {
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
						ThreadTicketing.categoryListSelectMenu({
							categories,
							customId: super.customId('ticket_threads_categories_create_list'),
							locale: interaction.locale,
						}),
					],
					ephemeral: true,
				})
				.catch(() => false);
		}
	}

	@DeferReply({ ephemeral: true })
	private lockTicket(context: Component.Context) {
		return ThreadTicketing.lockTicket.call(this, context, context.interaction.customId.includes('lock_and_close'));
	}

	@DeferReply({ ephemeral: true })
	private closeTicket(context: Component.Context) {
		return ThreadTicketing.closeTicket.call(this, context);
	}

	@DeferReply({ ephemeral: true })
	private deleteTicket(context: Component.Context) {
		return ThreadTicketing.deleteTicket.call(this, context);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_threads_categories_create_ticket'),
		super.customId('ticket_threads_categories_create_rename_title_modal'),
	];

	public execute({ interaction }: Modal.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.dynamicCustomId('ticket_threads_categories_create_ticket'): {
				return ThreadTicketing.createTicket.call(this, { interaction });
			}
			case super.customId('ticket_threads_categories_create_rename_title_modal'): {
				return this.renameTitle({ interaction });
			}
			default: {
				const translations = translate(interaction.locale).tickets.threads.categories.createModal.errors
					.invalidCustomId;

				return interaction.reply({
					embeds: [
						super.userEmbedError(interaction.user, translations.title()).setDescription(translations.description()),
					],
					ephemeral: true,
				});
			}
		}
	}

	@DeferReply({ ephemeral: true })
	private async renameTitle({ interaction }: Modal.Context) {
		const { channel, fields, guild, guildLocale, locale, member, user } = interaction;
		const translations = translate(locale).tickets.threads.categories.buttons;

		if (channel?.type !== ChannelType.PrivateThread && channel?.type !== ChannelType.PublicThread) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(user, translations._errorIfNotTicketChannel.title())
						.setDescription(translations._errorIfNotTicketChannel.description()),
				],
			});
		}

		if (!channel.editable) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(user, translations.renameTitle.modal.errors.notEditable.title())
						.setDescription(translations.renameTitle.modal.errors.notEditable.description()),
				],
			});
		}

		const [row] = await database
			.select({
				authorId: ticketsThreads.authorId,
				logsChannelId: ticketThreadsCategories.logsChannelId,
				managers: ticketThreadsCategories.managers,
			})
			.from(ticketsThreads)
			.where(eq(ticketsThreads.threadId, channel.id))
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));

		if (row?.authorId !== user.id && !row?.managers.some((id) => member.roles.resolve(id))) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(user, translations._errorIfNotTicketAuthorOrManager.title())
						.setDescription(translations._errorIfNotTicketAuthorOrManager.description()),
				],
			});
		}

		const oldTitle = channel.name;
		const { data: newTitle, success } = z.string().min(1).max(100).safeParse(fields.getTextInputValue('title'));

		if (!success) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.user, translations.renameTitle.modal.errors.tooLong.title())
						.setDescription(translations.renameTitle.modal.errors.tooLong.description()),
				],
			});
		}

		const successTranslations = translations.renameTitle.modal.success;
		const guildSuccessTranslations =
			translate(guildLocale).tickets.threads.categories.buttons.renameTitle.modal.success;
		const embed = super
			.userEmbed(user)
			.setColor(Colors.DarkGreen)
			.setTitle(successTranslations.title())
			.setDescription(successTranslations.user.description({ oldTitle, newTitle }));

		await channel.edit({ name: newTitle });
		await interaction.editReply({
			embeds: [embed],
		});

		if (row.logsChannelId) {
			const me = await guild.members.fetchMe();
			const logsChannel = await guild.channels.fetch(row.logsChannelId);

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
