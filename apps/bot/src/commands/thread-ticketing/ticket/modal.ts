import {
	database,
	eq,
	ThreadTicketActionsPermissionBitField,
	ticketsThreads,
	ticketThreadsCategories,
} from '@ticketer/database';
import { customId, DeferReply, dynamicCustomId, Modal, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { ChannelType, Colors, PermissionFlagsBits } from 'discord.js';
import { z } from 'zod';
import { translate } from '@/i18n';
import { fetchChannel, ThreadTicketing } from '@/utils';

export default class extends Modal.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_threads_categories_create_ticket')];

	public execute({ interaction }: Modal.Context) {
		return ThreadTicketing.createTicket({ interaction });
	}
}

export class RenameTitle extends Modal.Interaction {
	public readonly customIds = [customId('ticket_threads_categories_create_rename_title_modal')];

	@DeferReply({ ephemeral: true })
	public async execute({ interaction }: Modal.Context) {
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
