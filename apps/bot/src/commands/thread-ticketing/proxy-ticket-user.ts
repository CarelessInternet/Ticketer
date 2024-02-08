import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { ThreadTicketing } from '@/utils';
import { translate } from '@/i18n';

const dataTranslations = translate().commands['proxy-ticket-user'].data;

export default class extends Command.Interaction {
	public readonly data = super.ContextUserBuilder.setName(dataTranslations.name()).setDefaultMemberPermissions(
		PermissionFlagsBits.ManageThreads,
	);

	@DeferReply(true)
	public async execute({ interaction }: Command.Context<'user'>) {
		const user = interaction.targetUser;
		const list = await ThreadTicketing.categoryList({
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
