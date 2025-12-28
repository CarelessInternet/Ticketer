import { and, database, eq, ticketThreadsCategories, ticketThreadsCategoriesSelectSchema } from '@ticketer/database';
import {
	Component,
	customId,
	DeferReply,
	dynamicCustomId,
	extractCustomId,
	userEmbedError,
} from '@ticketer/djs-framework';
import { MessageFlags } from 'discord.js';
import { prettifyError } from 'zod';
import { translate } from '@/i18n';
import { ThreadTicketing } from '@/utils';

export default class extends Component.Interaction {
	public readonly customIds = [
		customId('ticket_threads_category_create_lock'),
		customId('ticket_threads_category_create_lock_and_close'),
	];

	@DeferReply({ ephemeral: true })
	public execute(context: Component.Context) {
		return ThreadTicketing.lockTicket(context, context.interaction.customId.includes('lock_and_close'));
	}
}

export class Lock extends Component.Interaction {
	public readonly customIds = [customId('ticket_threads_category_create_close')];

	@DeferReply({ ephemeral: true })
	public execute(context: Component.Context) {
		return ThreadTicketing.closeTicket(context);
	}
}

export class Delete extends Component.Interaction {
	public readonly customIds = [customId('ticket_threads_category_create_delete')];

	@DeferReply({ ephemeral: true })
	public execute(context: Component.Context) {
		return ThreadTicketing.deleteTicket(context);
	}
}

export class RenameTitle extends Component.Interaction {
	public readonly customIds = [customId('ticket_threads_category_create_rename_title')];

	public execute(context: Component.Context) {
		return ThreadTicketing.renameTitleModal(context);
	}
}

export class CreateTicketModal extends Component.Interaction {
	public readonly customIds = [
		customId('ticket_threads_categories_create_list'),
		dynamicCustomId('ticket_threads_categories_create_list_proxy'),
	];

	public async execute({ interaction }: Component.Context<'string'>) {
		const { dynamicValue: proxiedUserId } = extractCustomId(interaction.customId);
		const {
			data: categoryId,
			error,
			success,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(interaction.values.at(0)));
		const translations = translate(interaction.locale).tickets.threads.categories.createModal.errors.invalidId;

		if (!success) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
						title: translations.title(),
					}),
				],
			});
		}

		const [row] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		if (!row) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: translations.description(),
						member: interaction.member,
						title: translations.title(),
					}),
				],
			});
		}

		if (row.skipModal) {
			return ThreadTicketing.createTicket({ interaction }, { categoryId: row.id, proxiedUserId });
		}

		void interaction
			.showModal(
				ThreadTicketing.ticketModal({
					categoryId: row.id,
					locale: interaction.locale,
					proxiedUserId,
					titleAndDescriptionRequired: row.titleAndDescriptionRequired,
				}),
			)
			.catch(() => false);
	}
}

export class CreateTicketPanel extends Component.Interaction {
	public readonly customIds = [customId('ticket_threads_categories_create_list_panel')];

	public async execute({ interaction }: Component.Context<'button'>) {
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
			const { id: categoryId, skipModal, titleAndDescriptionRequired } = categories.at(0)!;

			if (skipModal) {
				return ThreadTicketing.createTicket({ interaction }, { categoryId });
			}

			void interaction
				.showModal(
					ThreadTicketing.ticketModal({
						categoryId,
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
