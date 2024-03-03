import { Component, DeferReply, Modal } from '@ticketer/djs-framework';
import { UserForums } from '@/utils';

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [super.customId('ticket_user_forums_thread_rename_title')];

	public execute(context: Component.Context) {
		void UserForums.renameTitleModal.call(this, context);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [super.customId('ticket_user_forums_thread_rename_title_modal')];

	@DeferReply({ ephemeral: true })
	public execute(context: Modal.Context) {
		void UserForums.renameTitle.call(this, context);
	}
}
