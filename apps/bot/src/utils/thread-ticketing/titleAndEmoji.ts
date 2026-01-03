import type { ticketThreadsCategories } from '@ticketer/database';
import { formatEmoji } from 'discord.js';
import { extractDiscordEmoji } from '../utility';

type Table = typeof ticketThreadsCategories.$inferSelect;

export const titleAndEmoji = (title: Table['categoryTitle'], emoji?: Table['categoryEmoji']) =>
	emoji ? `${extractDiscordEmoji(emoji).isSnowflake ? formatEmoji(emoji) : emoji} ${title}` : title;
