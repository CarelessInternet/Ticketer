import type { ticketsThreads } from '@ticketer/database';
import { Locale } from 'discord.js';
import { translate } from '@/i18n';

export type TicketState = typeof ticketsThreads.$inferSelect.state;

export const ticketState = (state: TicketState, locale?: Locale) =>
	translate(locale ?? Locale.EnglishGB).tickets.threads.categories.ticketState[state]();
