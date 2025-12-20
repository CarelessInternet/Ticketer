import { Command } from '@ticketer/djs-framework';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import { translate } from '@/i18n';
import { ThreadTicketing } from '@/utils';

const dataTranslations = translate().commands['proxy-ticket']['context-user'].data;

export default class extends Command.Interaction {
	public readonly data = super.ContextUserBuilder.setName(dataTranslations.name()).setDefaultMemberPermissions(
		PermissionFlagsBits.ManageThreads,
	);

	public async execute({ interaction }: Command.Context<'user'>) {
		const user = interaction.targetUser;
		const categories = await ThreadTicketing.categoryList({
			filterManagerIds: interaction.member.roles,
			guildId: interaction.guildId,
		});

		if (categories.length === 0) {
			const translations = translate(interaction.locale).tickets.threads.categories.createTicket.errors.noCategories;

			return interaction
				.reply({
					embeds: [
						super.userEmbedError(interaction.member, translations.title()).setDescription(translations.description()),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		if (categories.length === 1) {
			// biome-ignore lint/style/noNonNullAssertion: It should exist.
			const { id: categoryId, skipModal, titleAndDescriptionRequired } = categories.at(0)!;

			if (skipModal) {
				return ThreadTicketing.createTicket.call(this, { interaction }, { categoryId, proxiedUserId: user.id });
			}

			void interaction
				.showModal(
					ThreadTicketing.ticketModal.call(this, {
						categoryId,
						locale: interaction.locale,
						proxiedUserId: user.id,
						titleAndDescriptionRequired,
					}),
				)
				.catch(() => false);
		} else {
			return interaction
				.reply({
					components: [
						ThreadTicketing.categoryListSelectMenuRow({
							categories,
							customId: super.customId('ticket_threads_categories_create_list_proxy', user.id),
							locale: interaction.locale,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}
	}
}
