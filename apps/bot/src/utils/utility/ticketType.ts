import {
	automaticThreadsConfigurations,
	database,
	eq,
	sql,
	ticketThreadsCategories,
	unionAll,
	userForumsConfigurations,
} from '@ticketer/database';
import { ChannelType, type GuildTextBasedChannel } from 'discord.js';

export enum TicketType {
	ThreadTicketing,
	UserForums,
	AutomaticThreads,
}

export async function ticketType(channel: GuildTextBasedChannel | null) {
	if (!channel) return;

	const id =
		channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread
			? channel.parentId
			: channel.id;

	if (!id) return;

	const [row] = await unionAll(
		database
			.select({ type: sql<string>`'${TicketType.ThreadTicketing}'`.as('ticket_type') })
			.from(ticketThreadsCategories)
			.where(eq(ticketThreadsCategories.channelId, id)),
		database
			.select({ type: sql<string>`'${TicketType.UserForums}'`.as('ticket_type') })
			.from(userForumsConfigurations)
			.where(eq(userForumsConfigurations.channelId, id)),
		database
			.select({ type: sql<string>`'${TicketType.AutomaticThreads}'`.as('ticket_type') })
			.from(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.channelId, id)),
	);

	return Number.parseInt(String(row?.type), 10);
}
