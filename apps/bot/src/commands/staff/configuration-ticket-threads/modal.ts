import {
	and,
	database,
	eq,
	ticketThreadsCategories,
	ticketThreadsCategoriesInsertSchema,
	ticketThreadsCategoriesSelectSchema,
} from '@ticketer/database';
import {
	customId,
	DeferReply,
	dynamicCustomId,
	extractCustomId,
	Modal,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import { inlineCode } from 'discord.js';
import { prettifyError } from 'zod';
import { extractEmoji } from '@/utils';
import { HasGlobalConfiguration } from './helpers';

const MAXIMUM_CATEGORY_AMOUNT = 10;

export default class extends Modal.Interaction {
	public readonly customIds = [
		customId('ticket_threads_category_fields'),
		dynamicCustomId('ticket_threads_category_fields_dynamic'),
		dynamicCustomId('ticket_threads_category_message'),
		dynamicCustomId('ticket_threads_category_thread_title'),
	];

	@DeferReply()
	@HasGlobalConfiguration
	public async execute({ interaction }: Modal.Context) {
		const { customId: id } = extractCustomId(interaction.customId);

		switch (id) {
			case customId('ticket_threads_category_fields'):
			case dynamicCustomId('ticket_threads_category_fields_dynamic'): {
				return this.categoryFields({ interaction });
			}
			case dynamicCustomId('ticket_threads_category_message'): {
				return this.categoryMessageTitleDescription({ interaction });
			}
			case dynamicCustomId('ticket_threads_category_thread_title'): {
				return this.categoryThreadTitle({ interaction });
			}
			default: {
				return interaction.editReply({
					embeds: [userEmbedError({ ...interaction, description: 'The modal ID could not be found.' })],
				});
			}
		}
	}

	private async categoryFields({ interaction }: Modal.Context) {
		const { customId, fields, guildId } = interaction;
		const { dynamicValue } = extractCustomId(customId);

		const emoji = fields.getTextInputValue('emoji');
		const categoryEmoji = extractEmoji(emoji);

		const {
			data: values,
			error,
			success,
		} = ticketThreadsCategoriesInsertSchema.pick({ categoryTitle: true, categoryDescription: true }).safeParse({
			categoryTitle: fields.getTextInputValue('title'),
			categoryDescription: fields.getTextInputValue('description'),
		});

		if (!success) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
			});
		}

		const { categoryDescription, categoryTitle } = values;

		if (dynamicValue) {
			const {
				data: categoryId,
				error: idError,
				success: idSuccess,
			} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

			if (!idSuccess) {
				return interaction.editReply({
					embeds: [userEmbedError({ ...interaction, description: prettifyError(idError) })],
				});
			}

			await database
				.update(ticketThreadsCategories)
				.set({ categoryDescription, categoryEmoji, categoryTitle })
				.where(
					and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)),
				);
		} else {
			const amount = await database.$count(ticketThreadsCategories, eq(ticketThreadsCategories.guildId, guildId));

			if (amount >= MAXIMUM_CATEGORY_AMOUNT) {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							...interaction,
							description: `There are too many categories, you may not have more than ${MAXIMUM_CATEGORY_AMOUNT.toString()}.`,
						}),
					],
				});
			}

			await database
				.insert(ticketThreadsCategories)
				.values({ categoryDescription, categoryEmoji, categoryTitle, guildId });
		}

		const embed = userEmbed(interaction)
			.setTitle(`${dynamicValue ? 'Updated the' : 'Created a'} Thread Ticket Category`)
			.setDescription(
				`${interaction.member} ${
					dynamicValue ? 'updated' : 'created'
				} the thread ticket category with the following details:`,
			)
			.setFields(
				{
					name: 'Emoji',
					value: categoryEmoji ?? 'None.',
					inline: true,
				},
				{
					name: 'Title',
					value: categoryTitle,
					inline: true,
				},
				{
					name: 'Description',
					value: categoryDescription,
				},
			);

		return interaction.editReply({
			embeds: [embed],
		});
	}

	private async categoryMessageTitleDescription({ interaction }: Modal.Context) {
		const { customId, fields } = interaction;
		const { dynamicValue } = extractCustomId(customId, true);
		const {
			data: categoryId,
			error: idError,
			success: idSuccess,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!idSuccess) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(idError) })],
			});
		}

		const {
			data: values,
			error,
			success,
		} = ticketThreadsCategoriesInsertSchema
			.pick({ openingMessageTitle: true, openingMessageDescription: true })
			.safeParse({
				openingMessageTitle: fields.getTextInputValue('title'),
				openingMessageDescription: fields.getTextInputValue('description'),
			});

		if (!success) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
			});
		}

		const { openingMessageDescription, openingMessageTitle } = values;

		await database
			.update(ticketThreadsCategories)
			.set({ openingMessageTitle, openingMessageDescription })
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} updated the opening message title and description to the following if they have text:`,
			);

		if (openingMessageTitle) {
			embed.addFields({
				name: 'Title',
				value: openingMessageTitle,
				inline: true,
			});
		}

		if (openingMessageDescription) {
			embed.addFields({
				name: 'Description',
				value: openingMessageDescription,
				inline: true,
			});
		}

		return interaction.editReply({ embeds: [embed] });
	}

	private async categoryThreadTitle({ interaction }: Modal.Context) {
		const { customId, fields } = interaction;
		const { dynamicValue } = extractCustomId(customId, true);
		const {
			data: categoryId,
			error: idError,
			success: idSuccess,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!idSuccess) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(idError) })],
			});
		}

		const {
			data: values,
			error,
			success,
		} = ticketThreadsCategoriesInsertSchema
			.pick({ threadTitle: true })
			.safeParse({ threadTitle: fields.getTextInputValue('title') });

		if (!success) {
			return interaction.editReply({
				embeds: [userEmbedError({ ...interaction, description: prettifyError(error) })],
			});
		}

		const { threadTitle } = values;

		await database
			.update(ticketThreadsCategories)
			.set({ threadTitle })
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const embed = userEmbed(interaction)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${interaction.member} updated the ticket thread title to the following if it has text: ${threadTitle ? inlineCode(threadTitle) : 'Empty'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}
}
