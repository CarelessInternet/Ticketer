import { and, database, eq, exists, ticketsThreads } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { LogExceptions } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.ThreadUpdate;

	@LogExceptions
	public execute([oldThread, newThread]: Event.ArgumentsOf<this['name']>) {
		const archived = !oldThread.archived && newThread.archived;
		const unarchived = oldThread.archived && !newThread.archived;
		const locked = !oldThread.locked && newThread.locked;
		const unlocked = oldThread.locked && !newThread.locked;
		const lockedAndArchived = (newThread.archived && locked) || (newThread.locked && archived);
		const threadIsByBot = newThread.ownerId === newThread.client.user.id;

		if (!threadIsByBot) return;

		const whereCondition = and(
			eq(ticketsThreads.threadId, newThread.id),
			exists(database.select().from(ticketsThreads).where(eq(ticketsThreads.threadId, newThread.id)).limit(1)),
		);

		// Two events are sent when the thread is archived but the locked button is pressed. We pray for no race conditions 🙏.
		if (lockedAndArchived) {
			return database.update(ticketsThreads).set({ state: 'lockedAndArchived' }).where(whereCondition);
		} else if (unarchived || unlocked) {
			if (unlocked && newThread.archived) {
				return database.update(ticketsThreads).set({ state: 'archived' }).where(whereCondition);
			} else if (unarchived && newThread.locked) {
				return database.update(ticketsThreads).set({ state: 'locked' }).where(whereCondition);
			} else {
				return database.update(ticketsThreads).set({ state: 'active' }).where(whereCondition);
			}
		} else if (archived || locked) {
			return database
				.update(ticketsThreads)
				.set({ state: archived ? 'archived' : 'locked' })
				.where(whereCondition);
		}
	}
}
