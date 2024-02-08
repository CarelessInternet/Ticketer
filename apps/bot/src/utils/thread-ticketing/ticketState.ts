import { Locale } from 'discord.js';
import type { ticketsThreads } from '@ticketer/database';
import { translate } from '@/i18n';

type TicketState = typeof ticketsThreads.$inferSelect.state;

export const ticketState = (state: TicketState, locale?: Locale) =>
	translate(locale ?? Locale.EnglishGB).tickets.threads.categories.ticketState[state]();
