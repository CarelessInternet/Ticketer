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
	filterManagerIds?: Snowflake[];
	guildId: Snowflake;
}

export async function categoryList({ filterManagerIds, guildId }: CategoryListOptions) {
	const rawCategories = await database
		.select()
		.from(ticketThreadsCategories)
		.where(eq(ticketThreadsCategories.guildId, guildId))
		// Limited at 25 because that iss the maximum amount of select menu options.
		.limit(25);

	return filterManagerIds && filterManagerIds.length > 0
		? rawCategories.filter((category) => category.managers.some((id) => filterManagerIds.includes(id)))
		: rawCategories;
}

interface CategoryListSelectMenuOptions {
	categories: Awaited<ReturnType<typeof categoryList>>;
	customId: BaseInteraction.CustomIds[number];
	locale: Locale;
}

export function categoryListSelectMenu({ categories, customId, locale }: CategoryListSelectMenuOptions) {
	const translations = translate(locale).tickets.threads.categories.categoryList;
	const options = categories.map((category) =>
		(category.categoryEmoji
			? new StringSelectMenuOptionBuilder().setEmoji(category.categoryEmoji)
			: new StringSelectMenuOptionBuilder()
		)
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
