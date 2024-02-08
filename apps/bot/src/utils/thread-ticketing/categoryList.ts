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

interface CategoryListOptions {
	customId: BaseInteraction.CustomIds[number];
	guildId: Snowflake;
	locale: Locale;
	filterManagerIds?: Snowflake[];
}

export async function categoryList({ customId, filterManagerIds, locale, guildId }: CategoryListOptions) {
	const rawCategories = await database
		.select()
		.from(ticketThreadsCategories)
		.where(eq(ticketThreadsCategories.guildId, guildId))
		// Limit to 25 because that's the maximum amount of select menu options.
		.limit(25);

	const categories =
		filterManagerIds && filterManagerIds.length > 0
			? rawCategories.filter((category) => category.managers.some((id) => filterManagerIds.includes(id)))
			: rawCategories;

	if (categories.length <= 0) return;

	const translations = translate(locale).tickets.threads.categories.categoryList;
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
