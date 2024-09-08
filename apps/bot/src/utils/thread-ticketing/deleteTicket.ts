import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { ChannelType, Colors, PermissionFlagsBits, inlineCode } from 'discord.js';
import {
	ThreadTicketActionsPermissionBitField,
	database,
	eq,
	ticketThreadsCategories,
	ticketsThreads,
} from '@ticketer/database';
import { fetchChannel } from '..';
import { translate } from '@/i18n';

export async function deleteTicket(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context | Component.Context,
) {
	const { channel, guild, guildLocale, locale, member } = interaction;
	const translations = translate(locale).tickets.threads.categories.actions;
	const guildSuccessTranslations =
		translate(guildLocale).tickets.threads.categories.actions.delete.execute.success.logs;

	if (channel?.type !== ChannelType.PrivateThread && channel?.type !== ChannelType.PublicThread) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(member, translations._errorIfNotTicketChannel.title()).setDescription(
					translations._errorIfNotTicketChannel.description(),
				),
			],
		});
	}

	if (!channel.manageable) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(member, translations.lock.execute.errors.notManageable.title()).setDescription(
					translations.lock.execute.errors.notManageable.description(),
				),
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
					this.userEmbedError(member, translations._errorIfNotTicketAuthorOrManager.title()).setDescription(
						translations._errorIfNotTicketAuthorOrManager.description(),
					),
				],
			});
		}

		const authorPermissions = new ThreadTicketActionsPermissionBitField(row.allowedAuthorActions);

		if (!authorPermissions.has(ThreadTicketActionsPermissionBitField.Flags.Delete)) {
			return interaction.editReply({
				embeds: [
					this.userEmbedError(member, translations._errorIfNoAuthorPermissions.title()).setDescription(
						translations._errorIfNoAuthorPermissions.description(),
					),
				],
			});
		}
	}

	const embed = this.userEmbed(member)
		.setColor(Colors.Red)
		.setTitle(translations.delete.execute.success.user.title())
		.setDescription(translations.delete.execute.success.user.description());

	await interaction.editReply({ embeds: [embed] });
	await channel.delete();

	if (row.logsChannelId) {
		const me = await guild.members.fetchMe();
		const logsChannel = await fetchChannel(guild, row.logsChannelId);

		if (!logsChannel?.isTextBased()) return;
		if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]))
			return;

		void logsChannel.send({
			embeds: [
				embed.setTitle(guildSuccessTranslations.title()).setDescription(
					guildSuccessTranslations.description({
						member: member.toString(),
						threadId: inlineCode(channel.id),
						title: channel.name,
					}),
				),
			],
		});
	}
}
