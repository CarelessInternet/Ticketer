import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { LogExceptions, fetchChannel, ticketButtons, userForumEmbed } from '@/utils';
import { database, eq, userForumsConfigurations } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { translate } from '@/i18n';

export default class extends Event.Handler {
	public readonly name = Event.Name.ThreadCreate;

	@LogExceptions
	public async execute([thread, newlyCreated]: Event.ArgumentsOf<this['name']>) {
		if (!newlyCreated || !thread.parentId) return;

		const parent = thread.parent ?? (await fetchChannel(thread.guild, thread.parentId));
		const me = await thread.guild.members.fetchMe();

		if (!parent?.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessagesInThreads]))
			return;

		if (parent.type === ChannelType.GuildForum) {
			const member = await thread.guild.members.fetch(thread.ownerId ?? '').catch(() => false);

			if (typeof member === 'boolean') return;

			const [row] = await database
				.select({
					title: userForumsConfigurations.openingMessageTitle,
					description: userForumsConfigurations.openingMessageDescription,
				})
				.from(userForumsConfigurations)
				.where(eq(userForumsConfigurations.channelId, parent.id));

			if (!row) return;

			const embed = userForumEmbed({
				embed: super.embed,
				...row,
				member,
			});

			const translations = translate(thread.guild.preferredLocale).tickets.userForums.actions;
			const buttonsRow = ticketButtons({
				close: {
					customId: super.customId('ticket_user_forums_thread_close'),
					label: translations.close.builder.label(),
				},
				delete: {
					customId: super.customId('ticket_user_forums_thread_delete'),
					label: translations.delete.builder.label(),
				},
				lock: {
					customId: super.customId('ticket_user_forums_thread_lock'),
					label: translations.lock.builder.label(),
				},
				lockAndClose: {
					customId: super.customId('ticket_user_forums_thread_lock_and_close'),
					label: translations.lockAndClose.builder.label(),
				},
				renameTitle: {
					customId: super.customId('ticket_user_forums_thread_rename_title'),
					label: translations.renameTitle.builder.label(),
				},
			});

			return thread.send({ components: buttonsRow, embeds: [embed] });
		}
	}
}
