import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { ChannelType, Colors, PermissionFlagsBits, channelMention, userMention } from 'discord.js';
import { database, eq, ticketThreadsCategories, ticketsThreads } from '@ticketer/database';
import { translate } from '@/i18n';

export async function lockTicket(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context | Component.Context,
) {
	const { channel, guild, locale, member, user } = interaction;
	const translations = translate(locale).tickets.threads.categories.buttons;

	if (channel?.type !== ChannelType.PrivateThread && channel?.type !== ChannelType.PublicThread) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations._errorIfNotTicketChannel.title())
					.setDescription(translations._errorIfNotTicketChannel.description()),
			],
		});
	}

	// This is here just in case somebody bypassed the disabled buttons in locked threads.
	if (channel.locked) return;

	if (!channel.manageable) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations.lock.execute.errors.notManageable.title())
					.setDescription(translations.lock.execute.errors.notManageable.description()),
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
		.leftJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));

	if (row?.authorId !== user.id && !row?.managers?.some((id) => member.roles.resolve(id))) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations._errorIfNotTicketAuthorOrManager.title())
					.setDescription(translations._errorIfNotTicketAuthorOrManager.description()),
			],
		});
	}

	const embed = this.userEmbed(user)
		.setColor(Colors.DarkVividPink)
		.setTitle(translations.lock.execute.success.title())
		.setDescription(translations.lock.execute.success.user.description());

	await channel.setLocked(true);
	await interaction.editReply({ embeds: [embed] });

	if (row.logsChannelId) {
		const me = await guild.members.fetchMe();
		const logsChannel = await guild.channels.fetch(row.logsChannelId);

		if (!logsChannel?.isTextBased()) return;
		if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.SendMessages])) return;

		void logsChannel.send({
			embeds: [
				embed.setDescription(
					translations.lock.execute.success.logs.description({
						thread: channelMention(channel.id),
						member: userMention(user.id),
					}),
				),
			],
		});
	}
}
