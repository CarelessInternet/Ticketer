import { Component, DeferReply } from '@ticketer/djs-framework';
import { AutomaticThreads } from '@/utils';

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [super.customId('ticket_automatic_threads_thread_delete')];

	@DeferReply(true)
	public execute(context: Component.Context) {
		void AutomaticThreads.deleteTicket.call(this, context, true);
	}
}
