import type { ticketThreadsCategories } from '@ticketer/database';

type Table = typeof ticketThreadsCategories.$inferSelect;

export const titleAndEmoji = (title: Table['categoryTitle'], emoji?: Table['categoryEmoji']) =>
	emoji ? `${emoji} ${title}` : title;
