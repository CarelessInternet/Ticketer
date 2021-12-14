import { Snowflake } from 'discord.js';

export interface TicketingManagers {
	ID: number;
	GuildID: Snowflake;
	RoleID: Snowflake;
	SupportChannel: Snowflake;
	LogsChannel: Snowflake;
	ReplyEmbed: boolean;
}

export interface GuildMemberEvent {
	ID: number;
	GuildID: Snowflake;
	ChannelID: Snowflake;
	Enabled: boolean;
}
