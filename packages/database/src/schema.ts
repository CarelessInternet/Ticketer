import {
	boolean,
	char,
	customType,
	foreignKey,
	index,
	int,
	mysqlTable,
	tinyint,
	varchar,
} from 'drizzle-orm/mysql-core';

// https://orm.drizzle.team/docs/custom-types#examples
const jsonWithParsing = <Data>(name: string) =>
	customType<{ data: Data; driverData: string; notNull: true }>({
		dataType() {
			return 'json';
		},
		// For some reason, drizzle-orm's `json()` method doesn't parse the data automatically?
		fromDriver(value: string) {
			return JSON.parse(value);
		},
		toDriver(value: Data): string {
			return JSON.stringify(value);
		},
	})(name).notNull();

// TODO: change mode to 'string' when available: https://github.com/drizzle-team/drizzle-orm/issues/813
// const snowflake = (name: string) => bigint(name, { mode: 'bigint', unsigned: true });

const snowflake = customType<{ data: string }>({
	dataType() {
		return 'bigint unsigned';
	},
	// eslint-disable-next-line unicorn/prefer-native-coercion-functions
	fromDriver(value: unknown) {
		return String(value);
	},
	toDriver(value: string) {
		return value;
	},
});

export const welcomeAndFarewell = mysqlTable('welcomeAndFarewell', {
	guildId: snowflake('guildId').primaryKey(),
	welcomeChannelId: snowflake('welcomeChannelId').unique(),
	welcomeMessageTitle: varchar('welcomeMessageTitle', { length: 100 }),
	welcomeMessageDescription: varchar('welcomeMessageDescription', { length: 500 }),
	welcomeNewMemberRoles: jsonWithParsing('welcomeNewMemberRoles').$type<string[]>().default([]),
	welcomeEnabled: boolean('welcomeEnabled').notNull().default(true),
	farewellChannelId: snowflake('farewellChannelId').unique(),
	farewellMessageTitle: varchar('farewellMessageTitle', { length: 100 }),
	farewellMessageDescription: varchar('farewellMessageDescription', { length: 500 }),
	farewellEnabled: boolean('farewellEnabled').notNull().default(true),
});

export const ticketThreadsConfigurations = mysqlTable('ticketThreadsConfigurations', {
	guildId: snowflake('guildId').primaryKey(),
	activeTickets: tinyint('activeTickets', { unsigned: true }).notNull().default(1),
});

export const ticketThreadsCategories = mysqlTable(
	'ticketThreadsCategories',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		guildId: snowflake('guildId').notNull(),
		categoryEmoji: char('categoryEmoji').notNull(),
		categoryTitle: varchar('categoryTitle', { length: 100 }).notNull(),
		categoryDescription: varchar('categoryDescription', { length: 100 }).notNull(),
		channelId: snowflake('channelId'),
		logsChannelId: snowflake('logsChannelId'),
		managers: jsonWithParsing('managers').$type<string[]>().default([]),
		openingMessageTitle: varchar('openingMessageTitle', { length: 100 }),
		openingMessageDescription: varchar('openingMessageDescription', { length: 500 }),
		privateThreads: boolean('privateThreads').notNull().default(true),
		threadNotifications: boolean('threadNotifications').notNull().default(false),
	},
	(table) => ({
		guildIdIndex: index('guildId_index').on(table.guildId),
		references: foreignKey({
			columns: [table.guildId],
			foreignColumns: [ticketThreadsConfigurations.guildId],
			name: 'ticket_threads_categories_fk',
		}),
	}),
);

export const ticketsThreads = mysqlTable(
	'ticketsThreads',
	{
		threadId: snowflake('threadId').primaryKey(),
		authorId: snowflake('authorId').notNull(),
		categoryId: int('categoryId', { unsigned: true }).notNull(),
		guildId: snowflake('guildId').notNull(),
	},
	(table) => ({
		authorIdIndex: index('authorId_index').on(table.authorId),
		categoryIdIndex: index('categoryId_index').on(table.categoryId),
		guildIdIndex: index('guildId_index').on(table.guildId),
		references: foreignKey({
			columns: [table.guildId, table.categoryId],
			foreignColumns: [ticketThreadsCategories.guildId, ticketThreadsCategories.id],
			name: 'tickets_threads_fk',
		}),
	}),
);

export const ticketForumsConfigurations = mysqlTable(
	'ticketForumsConfigurations',
	{
		guildId: snowflake('guildId').notNull(),
		channelId: snowflake('channelId').notNull(),
		managers: jsonWithParsing('managers').$type<string[]>().default([]),
		openingMessageTitle: varchar('openingMessageTitle', { length: 100 }),
		openingMessageDescription: varchar('openingMessageDescription', { length: 500 }),
	},
	(table) => ({
		guildIdIndex: index('guildId_index').on(table.guildId),
		channelIdIndex: index('channelId_index').on(table.channelId),
	}),
);

export const automaticThreadsConfigurations = mysqlTable(
	'automaticThreadsConfigurations',
	{
		guildId: snowflake('guildId').notNull(),
		channelId: snowflake('channelId').notNull(),
		managers: jsonWithParsing('managers').$type<string[]>().default([]),
		openingMessageTitle: varchar('openingMessageTitle', { length: 100 }),
		openingMessageDescription: varchar('openingMessageDescription', { length: 500 }),
	},
	(table) => ({
		guildIdIndex: index('guildId_index').on(table.guildId),
		channelIdIndex: index('channelId_index').on(table.channelId),
	}),
);
