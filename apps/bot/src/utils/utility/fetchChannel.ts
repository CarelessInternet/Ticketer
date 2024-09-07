import { DiscordAPIError, type Guild, RESTJSONErrorCodes, type Snowflake } from 'discord.js';

// This async (<-- important) function prevents the bot from crashing if the channel is not found.
export async function fetchChannel(guild: Guild, id?: Snowflake | null) {
	if (!id) return;

	try {
		return await guild.channels.fetch(id);
	} catch (error) {
		if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel) return;
	}
}
