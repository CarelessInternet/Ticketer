import { DeferReply, Modal } from '@ticketer/djs-framework';
import {
	and,
	database,
	eq,
	ticketThreadsCategories,
	ticketThreadsCategoriesInsertSchema,
	ticketThreadsCategoriesSelectSchema,
} from '@ticketer/database';
import { extractEmoji, zodErrorToString } from '@/utils';
import { HasGlobalConfiguration } from './helpers';

const MAXIMUM_CATEGORY_AMOUNT = 10;

export default class extends Modal.Interaction {
	public readonly customIds = [
		super.customId('ticket_threads_category_fields'),
		super.dynamicCustomId('ticket_threads_category_fields_dynamic'),
		super.dynamicCustomId('ticket_threads_category_message'),
	];

	@DeferReply()
	@HasGlobalConfiguration
	public async execute({ interaction }: Modal.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.customId('ticket_threads_category_fields'):
			case super.dynamicCustomId('ticket_threads_category_fields_dynamic'): {
				return this.categoryFields({ interaction });
			}
			case super.dynamicCustomId('ticket_threads_category_message'): {
				return this.categoryMessageTitleDescription({ interaction });
			}
			default: {
				return interaction.editReply({
					embeds: [super.userEmbedError(interaction.member).setDescription('The modal ID could not be found.')],
				});
			}
		}
	}

	private async categoryFields({ interaction }: Modal.Context) {
		const { customId, fields, guildId, member } = interaction;
		const { dynamicValue } = super.extractCustomId(customId);

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
				embeds: [super.userEmbedError(member).setDescription(zodErrorToString(error))],
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
					embeds: [super.userEmbedError(member).setDescription(zodErrorToString(idError))],
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
						super
							.userEmbedError(member)
							.setDescription(
								`There are too many categories, you may not have more than ${MAXIMUM_CATEGORY_AMOUNT.toString()}.`,
							),
					],
				});
			}

			await database
				.insert(ticketThreadsCategories)
				.values({ categoryDescription, categoryEmoji, categoryTitle, guildId });
		}

		const embed = super
			.userEmbed(member)
			.setTitle(`${dynamicValue ? 'Updated the' : 'Created a'} Thread Ticket Category`)
			.setDescription(
				`${member.toString()} ${
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
		const { customId, fields, member } = interaction;
		const { dynamicValue } = super.extractCustomId(customId, true);
		const {
			data: categoryId,
			error: idError,
			success: idSuccess,
		} = ticketThreadsCategoriesSelectSchema.shape.id.safeParse(Number(dynamicValue));

		if (!idSuccess) {
			return interaction.editReply({
				embeds: [super.userEmbedError(member).setDescription(zodErrorToString(idError))],
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
				embeds: [super.userEmbedError(member).setDescription(zodErrorToString(error))],
			});
		}

		const { openingMessageDescription, openingMessageTitle } = values;

		await database
			.update(ticketThreadsCategories)
			.set({ openingMessageTitle, openingMessageDescription })
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, interaction.guildId)));

		const embed = super
			.userEmbed(member)
			.setTitle('Updated the Thread Ticket Category')
			.setDescription(
				`${member.toString()} updated the opening message title and description to the following if they have text:`,
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
}
