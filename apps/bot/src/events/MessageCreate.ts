import { automaticThreadsConfigurations, database, eq } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	type ButtonBuilder,
	ChannelType,
	MessageFlags,
	MessageType,
	PermissionFlagsBits,
	ThreadAutoArchiveDuration,
} from 'discord.js';
import { translate } from '@/i18n';
import { automaticThreadsContainer, formatDateShort, LogExceptions, ticketButtons } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.MessageCreate;

	@LogExceptions
	public async execute([message]: Event.ArgumentsOf<this['name']>) {
		if (!message.guild || message.channel.type !== ChannelType.GuildText) return;
		if (message.type !== MessageType.Default) return;
		if (!message.member) return;

		const me = await message.guild.members.fetchMe();

		if (
			!message.channel
				.permissionsFor(me)
				.has([
					PermissionFlagsBits.CreatePublicThreads,
					PermissionFlagsBits.ViewChannel,
					PermissionFlagsBits.SendMessagesInThreads,
				])
		)
			return;
		if (message.author.id === me.id) return;

		const [row] = await database
			.select({
				title: automaticThreadsConfigurations.openingMessageTitle,
				description: automaticThreadsConfigurations.openingMessageDescription,
			})
			.from(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.channelId, message.channelId));

		if (!row) return;

		const thread = await message.startThread({
			autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
			name: `[${formatDateShort(message.createdAt)}] ${message.member.displayName}`,
		});

		const translations = translate(message.guild.preferredLocale).tickets.automaticThreads.actions;
		const { renameTitle, ...restButtons } = ticketButtons({
			close: {
				customId: super.customId('ticket_automatic_threads_thread_close'),
				label: translations.close.builder.label(),
			},
			delete: {
				customId: super.customId('ticket_automatic_threads_thread_delete'),
				label: translations.delete.builder.label(),
			},
			lock: {
				customId: super.customId('ticket_automatic_threads_thread_lock'),
				label: translations.lock.builder.label(),
			},
			lockAndClose: {
				customId: super.customId('ticket_automatic_threads_thread_lock_and_close'),
				label: translations.lockAndClose.builder.label(),
			},
			renameTitle: {
				customId: super.customId('ticket_automatic_threads_thread_rename_title'),
				label: translations.renameTitle.builder.label(),
			},
		});

		const container = super.container(
			automaticThreadsContainer({ ...row, member: message.member, renameTitleButton: renameTitle }),
		);
		const buttonRow = new ActionRowBuilder<ButtonBuilder>().setComponents(Object.values(restButtons));

		return thread.send({ components: [container, buttonRow], flags: [MessageFlags.IsComponentsV2] });
	}
}
