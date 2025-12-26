import {
	database,
	eq,
	ThreadTicketActionsPermissionBitField,
	ticketsThreads,
	ticketThreadsCategories,
} from '@ticketer/database';
import { type Command, type Component, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { ChannelType, Colors, PermissionFlagsBits } from 'discord.js';
import { translate } from '@/i18n';
import { fetchChannel } from '..';

export async function closeTicket({ interaction }: Command.Context | Component.Context) {
	const { channel, client, guild, guildLocale, locale, member } = interaction;
	const translations = translate(locale).tickets.threads.categories.actions;
	const guildSuccessTranslations = translate(guildLocale).tickets.threads.categories.actions.close.execute.success;

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

	if (channel.archived) return;
	if (!channel.editable) {
		return interaction.editReply({
			embeds: [
				userEmbedError({
					client,
					description: translations.close.execute.errors.notEditable.description(),
					member,
					title: translations.close.execute.errors.notEditable.title(),
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

		if (!authorPermissions.has(ThreadTicketActionsPermissionBitField.Flags.Close)) {
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

	const embed = userEmbed({ client, member })
		.setColor(Colors.Yellow)
		.setTitle(translations.close.execute.success.title())
		.setDescription(translations.close.execute.success.user.description());

	await channel.setArchived(true);
	await interaction.editReply({ embeds: [embed] });

	if (row.logsChannelId) {
		const me = await guild.members.fetchMe();
		const logsChannel = await fetchChannel(guild, row.logsChannelId);

		if (!logsChannel?.isTextBased()) return;
		if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]))
			return;

		void logsChannel.send({
			embeds: [
				embed.setTitle(guildSuccessTranslations.title()).setDescription(
					guildSuccessTranslations.logs.description({
						thread: channel.toString(),
						member: member.toString(),
					}),
				),
			],
		});
	}
}
