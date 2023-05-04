import type { Snowflake } from 'discord.js';

export interface TicketingManagers {
	ID: number;
	GuildID: Snowflake;
	RoleID: Snowflake;
	/**
	 * For thread based ticketing
	 */
	SupportChannel: Snowflake;
	Notes: string | null;
	PanelInformation: string | null;
	LogsChannel: Snowflake;
	NotificationChannel: Snowflake;
	ThreadNotifications: boolean
	/**
	 * For text channel based ticketing
	 */
	SupportCategory: Snowflake;
	UseTextChannels: boolean;
	TextChannelPing: boolean;
	PrivateThreads: boolean;
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
	PanelInformation: string | null;
	Target: number;
}
