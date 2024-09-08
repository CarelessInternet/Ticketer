import { database, eq, ticketsThreads } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { LogExceptions } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.ThreadDelete;

	@LogExceptions
	public execute([thread]: Event.ArgumentsOf<this['name']>) {
		const threadIsByBot = thread.ownerId === thread.client.user.id;

		if (threadIsByBot) {
			void database
				.delete(ticketsThreads)
				.where(eq(ticketsThreads.threadId, thread.id))
				.catch(() => false);
		}
	}
}
