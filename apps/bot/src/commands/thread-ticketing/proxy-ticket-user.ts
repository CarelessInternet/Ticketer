import { Command } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { ThreadTicketing } from '@/utils';
import { translate } from '@/i18n';

const dataTranslations = translate().commands['proxy-ticket-user'].data;

export default class extends Command.Interaction {
	public readonly data = super.ContextUserBuilder.setName(dataTranslations.name()).setDefaultMemberPermissions(
		PermissionFlagsBits.ManageThreads,
	);

	public async execute({ interaction }: Command.Context<'user'>) {
		const user = interaction.targetUser;
		const categories = await ThreadTicketing.categoryList({
			filterManagerIds: [...interaction.member.roles.cache.keys()],
			guildId: interaction.guildId,
		});

		if (categories.length === 0) {
			const translations = translate(interaction.locale).tickets.threads.categories.createTicket.errors.noCategories;

			return interaction
				.reply({
					embeds: [
						super.userEmbedError(interaction.user, translations.title()).setDescription(translations.description()),
					],
					ephemeral: true,
				})
				.catch(() => false);
		}

		if (categories.length === 1) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { id, titleAndDescriptionRequired } = categories.at(0)!;

			void interaction
				.showModal(
					ThreadTicketing.ticketModal.call(this, {
						categoryId: id,
						locale: interaction.locale,
						titleAndDescriptionRequired,
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
