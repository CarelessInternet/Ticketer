import { Component, DeferReply, Modal } from '@ticketer/djs-framework';
import { AutomaticThreads } from '@/utils';

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [super.customId('ticket_automatic_threads_thread_rename_title')];

	public execute(context: Component.Context) {
		void AutomaticThreads.renameTitleModal.call(this, context, true);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [super.customId('ticket_automatic_threads_thread_rename_title_modal')];

	@DeferReply({ ephemeral: true })
	public execute(context: Modal.Context) {
		void AutomaticThreads.renameTitle.call(this, context, true);
	}
}
