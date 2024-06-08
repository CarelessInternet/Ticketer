import { Command } from '@ticketer/djs-framework';
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

	public async execute({ interaction }: Command.Context<'chat'>) {
		const user = interaction.options.getUser('member', true);
		const categories = await ThreadTicketing.categoryList({
			filterManagerIds: [...interaction.member.roles.cache.keys()],
			guildId: interaction.guildId,
		});

		if (categories.length === 0) {
			const translations = translate(interaction.locale).tickets.threads.categories.createTicket.errors.noCategories;

			return interaction
				.reply({
					embeds: [
						super
							.userEmbedError(interaction.user)
							.setTitle(translations.title())
							.setDescription(translations.description()),
					],
					ephemeral: true,
				})
				.catch(() => false);
		}

		if (categories.length === 1) {
			void interaction
				.showModal(
					ThreadTicketing.ticketModal.call(this, {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						categoryId: categories.at(0)!.id,
						locale: interaction.locale,
					}),
				)
				.catch(() => false);
		} else {
			return interaction
				.reply({
					components: [
						ThreadTicketing.categoryListSelectMenu({
							categories,
							customId: super.customId('ticket_threads_categories_create_list_proxy', user.id),
							locale: interaction.locale,
						}),
					],
					ephemeral: true,
				})
				.catch(() => false);
		}
	}
}
