import { Command, customId, userEmbedError } from '@ticketer/djs-framework';
import { MessageFlags } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { ThreadTicketing } from '@/utils';

const dataTranslations = translate().commands.ticket.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.ticket.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.ticket.data.description'));

	public async execute({ interaction }: Command.Context) {
		const categories = await ThreadTicketing.categoryList({ guildId: interaction.guildId });

		if (categories.length === 0) {
			const translations = translate(interaction.locale).tickets.threads.categories.createTicket.errors.noCategories;

			return interaction
				.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: translations.description(),
							member: interaction.member,
							title: translations.title(),
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		if (categories.length === 1) {
			// biome-ignore lint/style/noNonNullAssertion: It should exist.
			const { id, skipModal, titleAndDescriptionRequired } = categories.at(0)!;

			if (skipModal) {
				return ThreadTicketing.createTicket({ interaction }, { categoryId: id });
			}

			void interaction
				.showModal(
					ThreadTicketing.ticketModal({
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
						ThreadTicketing.categoryListSelectMenuRow({
							categories,
							customId: customId('ticket_threads_categories_create_list'),
							locale: interaction.locale,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}
	}
}
