import { Component, customId, DeferReply, Modal } from '@ticketer/djs-framework';
import { AutomaticThreads } from '@/utils';

export default class extends Component.Interaction {
	public readonly customIds = [customId('ticket_automatic_threads_thread_rename_title')];

	public execute(context: Component.Context) {
		void AutomaticThreads.renameTitleModal(context, true);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [customId('ticket_automatic_threads_thread_rename_title_modal')];

	@DeferReply({ ephemeral: true })
	public execute(context: Modal.Context) {
		void AutomaticThreads.renameTitle(context, true);
	}
}
