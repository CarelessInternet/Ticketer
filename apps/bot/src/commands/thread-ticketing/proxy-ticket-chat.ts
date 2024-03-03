import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { ThreadTicketing } from '@/utils';
import { translate } from '@/i18n';

const dataTranslations = translate().commands['proxy-ticket-chat'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setDescription(dataTranslations.description())
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addUserOption((option) =>
			option
				.setName(dataTranslations.options[0].name())
				.setDescription(dataTranslations.options[0].description())
				.setRequired(true),
		);

	@DeferReply({ ephemeral: true })
	public async execute({ interaction }: Command.Context<'chat'>) {
		const user = interaction.options.getUser('member', true);
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
