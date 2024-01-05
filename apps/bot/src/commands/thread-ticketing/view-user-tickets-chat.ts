import { Command, Component, DeferReply, DeferUpdate } from '@ticketer/djs-framework';
import { PermissionFlagsBits, type Snowflake } from 'discord.js';
import { viewUserTickets } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('view-user-tickets')
		.setDescription("View a user's thread tickets.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addUserOption((option) =>
			option.setName('member').setDescription('The member whose tickets you want to see.').setRequired(true),
		);

	@DeferReply(false)
	public execute(context: Command.Context<'chat'>) {
		void viewUserTickets.call(this, context, context.interaction.options.getUser('member', true).id);
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
		const page = Number.parseInt(pageAsString) + (customId.includes('next') ? 1 : -1);

		void viewUserTickets.call(this, context, userId, page);
	}
}
