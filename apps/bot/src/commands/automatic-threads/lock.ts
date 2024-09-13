import { Component, DeferReply } from '@ticketer/djs-framework';
import { AutomaticThreads } from '@/utils';

export default class extends Component.Interaction {
	public readonly customIds = [super.customId('ticket_automatic_threads_thread_lock')];

	@DeferReply({ ephemeral: true })
	public execute(context: Component.Context) {
		void AutomaticThreads.lockTicket.call(this, context, false, true);
	}
}
