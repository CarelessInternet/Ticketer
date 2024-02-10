import { Command, Component, DeferReply, DeferUpdate } from '@ticketer/djs-framework';
import { PermissionFlagsBits, type Snowflake } from 'discord.js';
import { ThreadTicketing, parseInteger } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('view-user-tickets')
		.setDescription("View a user's thread tickets.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addUserOption((option) =>
			option.setName('member').setDescription('The member whose tickets you want to see.').setRequired(true),
		);

	@DeferReply(false)
	public execute(context: Command.Context<'chat'>) {
		void ThreadTicketing.viewUserTickets.call(this, context, {
			userId: context.interaction.options.getUser('member', true).id,
		});
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_threads_categories_view_user_previous'),
		super.dynamicCustomId('ticket_threads_categories_view_user_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context) {
		const { customId, dynamicValue } = super.extractCustomId(context.interaction.customId, true);
		const [pageAsString, userId] = dynamicValue.split('_') as [string, Snowflake];
		const currentPage = parseInteger(pageAsString);

		if (currentPage === undefined) return;

		const page = currentPage + (customId.includes('next') ? 1 : -1);

		void ThreadTicketing.viewUserTickets.call(this, context, { userId, page });
	}
}
