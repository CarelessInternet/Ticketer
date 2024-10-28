import {
	ActionRowBuilder,
	type Locale,
	type Snowflake,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { type ManagerIntersectionRoles, managerIntersection } from '..';
import { and, database, eq, ticketThreadsCategories } from '@ticketer/database';
import type { BaseInteraction } from '@ticketer/djs-framework';
import { translate } from '@/i18n';

interface CategoryListOptions {
	filterManagerIds?: ManagerIntersectionRoles;
	guildId: Snowflake;
}

export async function categoryList({ filterManagerIds, guildId }: CategoryListOptions) {
	const whereQuery = filterManagerIds
		? and(
				eq(ticketThreadsCategories.guildId, guildId),
				managerIntersection(ticketThreadsCategories.managers, filterManagerIds),
			)
		: eq(ticketThreadsCategories.guildId, guildId);

	// Limited at 25 because that is the maximum amount of select menu options.
	return database.select().from(ticketThreadsCategories).where(whereQuery).limit(25);
}

interface CategoryListSelectMenuOptions {
	categories: Awaited<ReturnType<typeof categoryList>>;
	customId: BaseInteraction.CustomIds[number];
	locale: Locale;
	maxValues?: number;
	minValues?: number;
	placeholder?: string;
}

export function categoryListSelectMenuRow({
	categories,
	customId,
	locale,
	maxValues = 1,
	minValues = 1,
	placeholder,
}: CategoryListSelectMenuOptions) {
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
		.setMinValues(minValues)
		.setMaxValues(maxValues)
		.setPlaceholder(placeholder ?? translations.placeholder())
		.setOptions(options);

	return new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(menu);
}
