import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { categoryList } from '@/utils';
import { translate } from '@/i18n';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('proxy-ticket')
		.setDescription('Create a ticket by proxy for a user.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addUserOption((option) =>
			option.setName('member').setDescription('The member who you want to create a ticket for.').setRequired(true),
		);

	@DeferReply(true)
	public async execute({ interaction }: Command.Context<'chat'>) {
		const user = interaction.options.getUser('member', true);
		const list = await categoryList({
			customId: super.customId('ticket_threads_categories_create_list_proxy', user.id),
			filterManagerIds: [...interaction.member.roles.cache.keys()],
			guildId: interaction.guildId,
			locale: interaction.locale,
		});

		if (!list) {
			const translations = translate(interaction.locale).tickets.threads.categories.createTicket.errors.noCategories;

			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(interaction.user)
						.setTitle(translations.title())
						.setDescription(translations.description()),
				],
			});
		}

		return interaction.editReply({ components: [list] });
	}
}
