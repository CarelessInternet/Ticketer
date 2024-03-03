import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { ThreadTicketing } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.ContextUserBuilder.setName("View User's Tickets").setDefaultMemberPermissions(
		PermissionFlagsBits.ManageThreads,
	);

	@DeferReply({ ephemeral: true })
	public execute(context: Command.Context<'user'>) {
		void ThreadTicketing.viewUserTickets.call(this, context, { userId: context.interaction.targetUser.id });
	}
}
