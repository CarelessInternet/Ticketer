import { baseTicketConfiguration, baseTicketConfigurationNotNull, jsonWithParsing, snowflake } from './utils';
import { boolean, foreignKey, index, int, mysqlEnum, mysqlTable, tinyint, varchar } from 'drizzle-orm/mysql-core';

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
		// This is not a char because one emoji can compose of several like 👨‍👩‍👦‍👦.
		categoryEmoji: varchar('categoryEmoji', { length: 8 }),
		categoryTitle: varchar('categoryTitle', { length: 100 }).notNull(),
		categoryDescription: varchar('categoryDescription', { length: 100 }).notNull(),
		channelId: snowflake('channelId'),
		logsChannelId: snowflake('logsChannelId'),
		...baseTicketConfiguration,
		privateThreads: boolean('privateThreads').notNull().default(true),
		silentPings: boolean('silentPings').notNull().default(true),
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
		state: mysqlEnum('state', ['active', 'archived', 'locked', 'lockedAndArchived']).notNull().default('active'),
	},
	(table) => ({
		authorIdIndex: index('authorId_index').on(table.authorId),
		categoryIdIndex: index('categoryId_index').on(table.categoryId),
		guildIdIndex: index('guildId_index').on(table.guildId),
		stateIndex: index('state_index').on(table.state),
		references: foreignKey({
			columns: [table.guildId, table.categoryId],
			foreignColumns: [ticketThreadsCategories.guildId, ticketThreadsCategories.id],
			name: 'tickets_threads_fk',
		}),
	}),
);

export const userForumsConfigurations = mysqlTable(
	'userForumsConfigurations',
	{
		channelId: snowflake('channelId').primaryKey(),
		guildId: snowflake('guildId').notNull(),
		...baseTicketConfigurationNotNull,
	},
	(table) => ({
		guildIdIndex: index('guildId_index').on(table.guildId),
	}),
);

export const automaticThreadsConfigurations = mysqlTable(
	'automaticThreadsConfigurations',
	{
		channelId: snowflake('channelId').primaryKey(),
		guildId: snowflake('guildId').notNull(),
		...baseTicketConfigurationNotNull,
	},
	(table) => ({
		guildIdIndex: index('guildId_index').on(table.guildId),
	}),
);
