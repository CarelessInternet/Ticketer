import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { categoryList } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.ContextUserBuilder.setName('Create Ticket by Proxy').setDefaultMemberPermissions(
		PermissionFlagsBits.ManageThreads,
	);

	@DeferReply(true)
	public async execute({ interaction }: Command.Context<'user'>) {
		const user = interaction.targetUser;
		const list = await categoryList(
			super.customId('ticket_threads_categories_create_list_proxy', user.id),
			interaction.locale,
			interaction.guildId,
		);

		return interaction.editReply({ components: [list] });
	}
}
