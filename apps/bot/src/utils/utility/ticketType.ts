import { ChannelType, type GuildTextBasedChannel } from 'discord.js';

export enum TicketType {
	ThreadTicketing,
	UserForums,
	AutomaticThreads,
}

export function ticketType(channel: GuildTextBasedChannel | null) {
	if (channel?.type === ChannelType.PrivateThread) {
		return TicketType.ThreadTicketing;
	}

	if (channel?.type === ChannelType.PublicThread) {
		if (channel.ownerId === channel.client.user.id) {
			return TicketType.ThreadTicketing;
		}

		switch (channel.parent?.type) {
			case ChannelType.GuildForum: {
				return TicketType.UserForums;
			}
			case ChannelType.GuildText: {
				return TicketType.AutomaticThreads;
			}
			default: {
				return;
			}
		}
	}
}
