import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { viewUserTickets } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.ContextUserBuilder.setName("View User's Tickets").setDefaultMemberPermissions(
		PermissionFlagsBits.ManageThreads,
	);

	@DeferReply(true)
	public execute(context: Command.Context<'user'>) {
		void viewUserTickets.call(this, context, { userId: context.interaction.targetUser.id });
	}
}
