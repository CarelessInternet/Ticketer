import { Component, DeferReply } from '@ticketer/djs-framework';
import { UserForums } from '@/utils';

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [super.customId('ticket_user_forums_thread_lock_and_close')];

	@DeferReply(true)
	public execute(context: Component.Context) {
		void UserForums.lockTicket.call(this, context, true);
	}
}
