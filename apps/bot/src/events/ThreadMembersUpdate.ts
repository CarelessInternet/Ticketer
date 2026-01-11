import {
	database,
	eq,
	ThreadTicketActionsPermissionBitField,
	ticketsThreads,
	ticketThreadsCategories,
} from '@ticketer/database';
import { Event, embed, userEmbed } from '@ticketer/djs-framework';
import { ChannelType, Colors, inlineCode, PermissionFlagsBits, userMention } from 'discord.js';
import { translate } from '@/i18n';
import { fetchChannel, LogExceptions } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.ThreadMembersUpdate;

	@LogExceptions
	public async execute([_, removedMembers, thread]: Event.ArgumentsOf<this['name']>) {
		if (thread.type !== ChannelType.PublicThread && thread.type !== ChannelType.PrivateThread) return;

		const author = removedMembers.at(0);
		if (!author) return;

		const [row] = await database
			.select({
				authorId: ticketsThreads.authorId,
				state: ticketsThreads.state,
				authorLeaveAction: ticketThreadsCategories.authorLeaveAction,
				logsChannelId: ticketThreadsCategories.logsChannelId,
			})
			.from(ticketsThreads)
			.where(eq(ticketsThreads.threadId, thread.id))
			.innerJoin(ticketThreadsCategories, eq(ticketsThreads.categoryId, ticketThreadsCategories.id));

		if (row?.authorId !== author.id || row.state !== 'active') return;

		const logEmbed = author.guildMember
			? userEmbed({ client: thread.client, member: author.guildMember })
			: embed({ client: thread.client });
		let state: 'lock' | 'close' | 'lockAndClose' | 'delete' = 'lock';

		if (row.authorLeaveAction === ThreadTicketActionsPermissionBitField.Flags.Lock) {
			if (!thread.manageable) return;
			await thread.setLocked(true);
			logEmbed.setColor(Colors.DarkVividPink);
		} else if (row.authorLeaveAction === ThreadTicketActionsPermissionBitField.Flags.Close) {
			if (!thread.editable) return;
			await thread.setArchived(true);
			logEmbed.setColor(Colors.Yellow);
			state = 'close';
		} else if (row.authorLeaveAction === ThreadTicketActionsPermissionBitField.Flags.LockAndClose) {
			if (!thread.manageable || !thread.editable) return;
			await thread.edit({ archived: true, locked: true });
			logEmbed.setColor(Colors.DarkVividPink);
			state = 'lockAndClose';
		} else if (row.authorLeaveAction === ThreadTicketActionsPermissionBitField.Flags.Delete) {
			if (!thread.manageable) return;
			await thread.delete();
			logEmbed.setColor(Colors.Red);
			state = 'delete';
		}

		if (row.logsChannelId && row.authorLeaveAction) {
			const me = await thread.guild.members.fetchMe();
			const logsChannel = await fetchChannel(thread.guild, row.logsChannelId);

			if (!logsChannel?.isTextBased()) return;
			if (!logsChannel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]))
				return;

			const translations = translate(thread.guild.preferredLocale).events.threadMembersUpdate.logs;
			void logsChannel.send({
				embeds: [
					logEmbed.setTitle(translations.title()).setDescription(
						translations.description({
							member: userMention(author.id),
							state,
							thread: state === 'delete' ? `${inlineCode(thread.name)} (${thread.id})` : thread.toString(),
						}),
					),
				],
			});
		}
	}
}
