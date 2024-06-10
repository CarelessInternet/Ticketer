import { Command, Component, DeferReply, DeferUpdate } from '@ticketer/djs-framework';
import { ThreadTicketing, goToPage } from '@/utils';
import { PermissionFlagsBits } from 'discord.js';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('view-user-tickets')
		.setDescription("View a user's thread tickets.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addUserOption((option) =>
			option.setName('member').setDescription('The member whose tickets you want to see.').setRequired(true),
		);

	@DeferReply()
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
		const { success, additionalData, error, page } = goToPage.call(this, context.interaction);

		if (!success) {
			return void context.interaction.editReply({
				components: [],
				embeds: [super.userEmbedError(context.interaction.user).setDescription(error)],
			});
		}

		void ThreadTicketing.viewUserTickets.call(this, context, {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			userId: additionalData.at(0)!,
			page,
		});
	}
}
