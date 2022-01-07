import type { Snowflake } from 'discord.js';

export interface TicketingManagers {
	ID: number;
	GuildID: Snowflake;
	RoleID: Snowflake;
	/**
	 * For thread based ticketing
	 */
	SupportChannel: Snowflake;
	LogsChannel: Snowflake;
	/**
	 * For text channel based ticketing
	 */
	SupportCategory: Snowflake;
	UseTextChannels: boolean;
	ReplyEmbed: boolean;
}

export interface GuildMemberEvent {
	ID: number;
	GuildID: Snowflake;
	ChannelID: Snowflake;
	Enabled: boolean;
}

export interface Suggestions {
	ID: number;
	GuildID: Snowflake;
	SuggestionsChannel: Snowflake;
	Target: number;
	ReplyEmbed: boolean;
	/**
	 * Might have to convert it to array via JSON.parse() first
	 */
	BlockedUsers: Snowflake[];
}
