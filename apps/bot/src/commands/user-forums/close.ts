import { Component, customId, DeferReply } from '@ticketer/djs-framework';
import { UserForums } from '@/utils';

export default class extends Component.Interaction {
	public readonly customIds = [customId('ticket_user_forums_thread_close')];

	@DeferReply({ ephemeral: true })
	public execute(context: Component.Context) {
		void UserForums.closeTicket(context);
	}
}
