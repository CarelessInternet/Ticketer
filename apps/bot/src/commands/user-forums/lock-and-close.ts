import { Component, DeferReply } from '@ticketer/djs-framework';
import { UserForums } from '@/utils';

export default class extends Component.Interaction {
	public readonly customIds = [super.customId('ticket_user_forums_thread_lock_and_close')];

	@DeferReply({ ephemeral: true })
	public execute(context: Component.Context) {
		void UserForums.lockTicket.call(this, context, true);
	}
}
