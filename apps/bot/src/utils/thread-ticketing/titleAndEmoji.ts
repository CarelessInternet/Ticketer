import type { ticketThreadsCategories } from '@ticketer/database';
import { formatEmoji } from 'discord.js';
import { extractDiscordEmoji } from '../utility';

type Table = typeof ticketThreadsCategories.$inferSelect;

/**
 * Only static/non-animated emojis are allowed.
 */
export const titleAndEmoji = (title: Table['categoryTitle'], emoji?: Table['categoryEmoji']) =>
	emoji ? `${extractDiscordEmoji(emoji).isSnowflake ? formatEmoji(emoji, false) : emoji} ${title}` : title;
