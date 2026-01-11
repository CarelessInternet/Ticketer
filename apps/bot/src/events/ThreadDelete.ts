import { database, eq, ticketsThreads } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { LogExceptions } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.ThreadDelete;

	@LogExceptions
	public execute([thread]: Event.ArgumentsOf<this['name']>) {
		if (thread.ownerId === thread.client.user.id) {
			void database
				.delete(ticketsThreads)
				.where(eq(ticketsThreads.threadId, thread.id))
				.catch(() => false);
		}
	}
}
