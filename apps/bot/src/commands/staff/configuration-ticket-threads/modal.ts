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
	DeferUpdate,
	dynamicCustomId,
	extractCustomId,
	Modal,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import { formatEmoji, inlineCode } from 'discord.js';
import { prettifyError } from 'zod';
import { discordEmojiFromId, extractDiscordEmoji } from '@/utils';
import { configurationMenu, HasGlobalConfiguration } from './helpers';

const MAXIMUM_CATEGORY_AMOUNT = 10;

export default class extends Modal.Interaction {
	public readonly customIds = [
		customId('ticket_threads_category_fields'),
		dynamicCustomId('ticket_threads_category_fields_dynamic'),
	];

	@HasGlobalConfiguration
	public async execute({ interaction }: Modal.Context) {
		const { customId, fields, guildId } = interaction;
		const { dynamicValue } = extractCustomId(customId);

		await (dynamicValue ? interaction.deferUpdate() : interaction.deferReply());

		let { emoji: categoryEmoji, isSnowflake } = extractDiscordEmoji(fields.getTextInputValue('emoji'));

		if (isSnowflake) {
			const fetchedEmoji = await discordEmojiFromId(interaction, categoryEmoji);

			if (!fetchedEmoji?.id || !fetchedEmoji.botInGuild || fetchedEmoji.animated) {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: 'The emoji ID is invalid, animated, or from a server the bot is not in.',
							member: interaction.member,
						}),
					],
				});
			}

			categoryEmoji = fetchedEmoji.id;
		}

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
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		const { categoryDescription, categoryTitle } = values;
		let categoryId = 0;

		if (dynamicValue) {
			const {
				data,
				error: idError,
				success: idSuccess,
			} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

			if (!idSuccess) {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: prettifyError(idError),
							member: interaction.member,
						}),
					],
				});
			}

			categoryId = data;
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
							client: interaction.client,
							description: `There are too many categories, you may not have more than ${MAXIMUM_CATEGORY_AMOUNT.toString()}.`,
							member: interaction.member,
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
					// biome-ignore lint/style/noNonNullAssertion: It is defined if isSnowflake is true.
					value: isSnowflake ? formatEmoji(categoryEmoji!, false) : (categoryEmoji ?? 'None'),
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

		interaction.editReply({ components: [], embeds: [embed] });

		if (categoryId) {
			return interaction.followUp({
				components: configurationMenu(categoryId),
				embeds: interaction.message?.embeds,
			});
		}
	}
}

export class CategoryMessage extends Modal.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_threads_category_message')];

	@DeferUpdate
	@HasGlobalConfiguration
	public async execute({ interaction }: Modal.Context) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const {
			data: categoryId,
			error: idError,
			success: idSuccess,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!idSuccess) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(idError),
						member: interaction.member,
					}),
				],
			});
		}

		const {
			data: values,
			error,
			success,
		} = ticketThreadsCategoriesInsertSchema
			.pick({ openingMessageTitle: true, openingMessageDescription: true })
			.safeParse({
				openingMessageTitle: interaction.fields.getTextInputValue('title'),
				openingMessageDescription: interaction.fields.getTextInputValue('description'),
			});

		if (!success) {
			interaction.editReply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
			return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message?.embeds });
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

		interaction.editReply({ components: [], embeds: [embed] });
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message?.embeds });
	}
}

export class ThreadTitle extends Modal.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_threads_category_thread_title')];

	@DeferUpdate
	@HasGlobalConfiguration
	public async execute({ interaction }: Modal.Context) {
		const { customId, fields } = interaction;
		const { dynamicValue } = extractCustomId(customId, true);
		const {
			data: categoryId,
			error: idError,
			success: idSuccess,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!idSuccess) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(idError),
						member: interaction.member,
					}),
				],
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
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
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

		interaction.editReply({ components: [], embeds: [embed] });
		return interaction.followUp({ components: configurationMenu(categoryId), embeds: interaction.message?.embeds });
	}
}
