import {
	ActionRowBuilder,
	type Locale,
	type Snowflake,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { database, eq, ticketThreadsCategories } from '@ticketer/database';
import type { BaseInteraction } from '@ticketer/djs-framework';
import { translate } from '@/i18n';

export async function categoryList(customId: BaseInteraction.CustomIds[number], locale: Locale, guildId: Snowflake) {
	const translations = translate(locale).tickets.threads.categories.categoryList;
	const categories = await database
		.select()
		.from(ticketThreadsCategories)
		.where(eq(ticketThreadsCategories.guildId, guildId))
		.limit(25);

	const options = categories.map((category) =>
		new StringSelectMenuOptionBuilder()
			.setEmoji(category.categoryEmoji)
			.setLabel(category.categoryTitle)
			.setDescription(category.categoryDescription)
			.setValue(category.id.toString()),
	);

	const menu = new StringSelectMenuBuilder()
		.setCustomId(customId)
		.setMinValues(1)
		.setMaxValues(1)
		.setPlaceholder(translations.placeholder())
		.setOptions(options);

	return new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(menu);
}
