import { and, count, database, eq, exists, ticketsThreads } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';

export default class extends Event.Handler {
	public readonly name = Event.Name.ThreadUpdate;

	public execute([oldThread, newThread]: Event.ArgumentsOf<this['name']>) {
		const unarchived = oldThread.archived && !newThread.archived;
		const unlocked = oldThread.locked && !newThread.locked;
		const threadIsByBot = newThread.ownerId === newThread.client.user.id;

		// Two events are sent when the thread is archived and the locked button is pressed. We pray for no race conditions 🙏.
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		if ((unarchived || unlocked) && threadIsByBot) {
			// Update the state to active if the thread ticket exists.
			return database
				.update(ticketsThreads)
				.set({ state: 'active' })
				.where(
					and(
						eq(ticketsThreads.threadId, newThread.id),
						exists(
							database
								.select({ _: count() })
								.from(ticketsThreads)
								.where(eq(ticketsThreads.threadId, newThread.id))
								.limit(1),
						),
					),
				);
		}
	}
}
