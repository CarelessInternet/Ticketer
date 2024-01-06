import { capitalise } from '..';
import type { ticketsThreads } from '@ticketer/database';

export const ticketState = (state: typeof ticketsThreads.$inferSelect.state) =>
	state === 'lockedAndArchived' ? 'Locked and Closed' : capitalise(state === 'archived' ? 'closed' : state);
