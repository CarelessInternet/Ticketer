import { Component, customId, DeferReply } from '@ticketer/djs-framework';
import { AutomaticThreads } from '@/utils';

export default class extends Component.Interaction {
	public readonly customIds = [customId('ticket_automatic_threads_thread_close')];

	@DeferReply({ ephemeral: true })
	public execute(context: Component.Context) {
		void AutomaticThreads.closeTicket(context, true);
	}
}
