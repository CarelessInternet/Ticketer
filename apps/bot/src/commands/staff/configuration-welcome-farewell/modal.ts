import { database, welcomeAndFarewell, welcomeAndFarewellInsertSchema } from '@ticketer/database';
import { customId, DeferReply, Modal, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { inlineCode } from 'discord.js';
import { prettifyError } from 'zod';
import type { InsertWithoutGuildId } from './helpers';

export default class extends Modal.Interaction {
	public readonly customIds = [customId('welcome_message_title'), customId('farewell_message_title')];

	@DeferReply()
	public async execute({ interaction }: Modal.Context) {
		const type = interaction.customId.includes('welcome') ? 'welcome' : 'farewell';
		const rawTitle = interaction.fields.getTextInputValue('message_title');
		const {
			data: title,
			error,
			success,
		} = type === 'welcome'
			? welcomeAndFarewellInsertSchema.shape.welcomeMessageTitle.safeParse(rawTitle)
			: welcomeAndFarewellInsertSchema.shape.farewellMessageTitle.safeParse(rawTitle);

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
					}),
				],
			});
		}

		const titleDatabaseValue: InsertWithoutGuildId =
			type === 'welcome' ? { welcomeMessageTitle: title } : { farewellMessageTitle: title };

		await database
			.insert(welcomeAndFarewell)
			.values({ guildId: interaction.guildId, ...titleDatabaseValue })
			.onDuplicateKeyUpdate({ set: titleDatabaseValue });

		const embed = userEmbed(interaction)
			.setTitle('Updated the Welcome/Farewell Configuration')
			.setDescription(
				`${interaction.member} updated the ${type} message title to` +
					(title ? `:\n\n${inlineCode(title)}` : ' the default title.'),
			);

		return interaction.editReply({ embeds: [embed] });
	}
}

export class Description extends Modal.Interaction {
	public readonly customIds = [customId('welcome_message_description'), customId('farewell_message_description')];

	@DeferReply()
	public async execute({ interaction }: Modal.Context) {
		const type = interaction.customId.includes('welcome') ? 'welcome' : 'farewell';
		const rawDescription = interaction.fields.getTextInputValue('message_description');
		const {
			data: description,
			error,
			success,
		} = type === 'welcome'
			? welcomeAndFarewellInsertSchema.shape.welcomeMessageDescription.safeParse(rawDescription)
			: welcomeAndFarewellInsertSchema.shape.farewellMessageDescription.safeParse(rawDescription);

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
					}),
				],
			});
		}

		const descriptionDatabaseValue: InsertWithoutGuildId =
			type === 'welcome' ? { welcomeMessageDescription: description } : { farewellMessageDescription: description };

		await database
			.insert(welcomeAndFarewell)
			.values({ guildId: interaction.guildId, ...descriptionDatabaseValue })
			.onDuplicateKeyUpdate({ set: descriptionDatabaseValue });

		const embed = userEmbed(interaction)
			.setTitle('Updated the Welcome/Farewell Configuration')
			.setDescription(
				`${interaction.member} updated the ${type} message description to` +
					(description ? `:\n\n${inlineCode(description)}` : ' the default description.'),
			);

		return interaction.editReply({ embeds: [embed] });
	}
}
