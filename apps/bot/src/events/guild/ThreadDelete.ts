import { database, eq, ticketsThreads } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';

export default class extends Event.Handler {
	public readonly name = Event.Name.ThreadDelete;

	public execute([thread]: Event.ArgumentsOf<this['name']>) {
		const threadIsByBot = thread.ownerId === thread.client.user.id;

		threadIsByBot &&
			database
				.delete(ticketsThreads)
				.where(eq(ticketsThreads.threadId, thread.id))
				.catch(() => false);
	}
}
