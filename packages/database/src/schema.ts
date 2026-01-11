import { sql } from 'drizzle-orm';
import {
	boolean,
	datetime,
	foreignKey,
	index,
	int,
	mysqlEnum,
	mysqlTable,
	tinyint,
	varchar,
} from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
	baseTicketConfiguration,
	baseTicketConfigurationNotNull,
	jsonWithParsing,
	snowflake,
	snowflakeRequiredParser,
} from './utility';

export const guildBlacklists = mysqlTable(
	'guildBlacklists',
	{
		guildId: snowflake('guildId').primaryKey(),
		reason: varchar('reason', { length: 500 }).notNull(),
		timestamp: datetime('timestamp', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [index('timestamp_index').on(table.timestamp)],
);

export const guildBlacklistsInsertSchema = createInsertSchema(guildBlacklists, {
	guildId: snowflakeRequiredParser,
	reason: (schema) => schema.min(1),
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

export const welcomeAndFarewellInsertSchema = createInsertSchema(welcomeAndFarewell);

export const ticketThreadsConfigurations = mysqlTable('ticketThreadsConfigurations', {
	guildId: snowflake('guildId').primaryKey(),
	activeTickets: tinyint('activeTickets', { unsigned: true }).notNull().default(1),
});

export const ticketThreadsConfigurationsInsertSchema = createInsertSchema(ticketThreadsConfigurations, {
	activeTickets: (schema) => schema.gte(1).lte(255),
});

export const ticketThreadsCategories = mysqlTable(
	'ticketThreadsCategories',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		guildId: snowflake('guildId').notNull(),
		allowedAuthorActions: int('allowedAuthorActions', { unsigned: true }),
		authorLeaveAction: int('authorLeaveAction', { unsigned: true }),
		// This is either a Unicode emoji or a Discord emoji (snowflake).
		categoryEmoji: varchar('categoryEmoji', { length: 21 }),
		categoryTitle: varchar('categoryTitle', { length: 100 }).notNull(),
		categoryDescription: varchar('categoryDescription', { length: 100 }).notNull(),
		channelId: snowflake('channelId'),
		logsChannelId: snowflake('logsChannelId'),
		...baseTicketConfiguration,
		privateThreads: boolean('privateThreads').notNull().default(true),
		silentPings: boolean('silentPings').notNull().default(true),
		skipModal: boolean('skipModal').notNull().default(false),
		threadNotifications: boolean('threadNotifications').notNull().default(false),
		threadTitle: varchar('threadTitle', { length: 100 }),
		titleAndDescriptionRequired: boolean('titleAndDescriptionRequired').notNull().default(true),
	},
	(table) => [
		index('guildId_index').on(table.guildId),
		foreignKey({
			columns: [table.guildId],
			foreignColumns: [ticketThreadsConfigurations.guildId],
			name: 'ticket_threads_categories_fk',
		}),
	],
);

export const ticketThreadsCategoriesSelectSchema = createSelectSchema(ticketThreadsCategories);
export const ticketThreadsCategoriesInsertSchema = createInsertSchema(ticketThreadsCategories);

export const ticketsThreads = mysqlTable(
	'ticketsThreads',
	{
		threadId: snowflake('threadId').primaryKey(),
		authorId: snowflake('authorId').notNull(),
		categoryId: int('categoryId', { unsigned: true }).notNull(),
		guildId: snowflake('guildId').notNull(),
		state: mysqlEnum('state', ['active', 'archived', 'locked', 'lockedAndArchived']).notNull().default('active'),
	},
	(table) => [
		index('authorId_index').on(table.authorId),
		index('categoryId_index').on(table.categoryId),
		index('guildId_index').on(table.guildId),
		index('state_index').on(table.state),
		foreignKey({
			columns: [table.guildId, table.categoryId],
			foreignColumns: [ticketThreadsCategories.guildId, ticketThreadsCategories.id],
			name: 'tickets_threads_fk',
		}),
	],
);

export const userForumsConfigurations = mysqlTable(
	'userForumsConfigurations',
	{
		channelId: snowflake('channelId').primaryKey(),
		guildId: snowflake('guildId').notNull(),
		...baseTicketConfigurationNotNull,
	},
	(table) => [index('guildId_index').on(table.guildId)],
);

export const userForumsConfigurationsSelectSchema = createSelectSchema(userForumsConfigurations, {
	channelId: snowflakeRequiredParser,
});
export const userForumsConfigurationsInsertSchema = createInsertSchema(userForumsConfigurations);

export const automaticThreadsConfigurations = mysqlTable(
	'automaticThreadsConfigurations',
	{
		channelId: snowflake('channelId').primaryKey(),
		guildId: snowflake('guildId').notNull(),
		...baseTicketConfigurationNotNull,
	},
	(table) => [index('guildId_index').on(table.guildId)],
);

export const automaticThreadsConfigurationsSelectSchema = createSelectSchema(automaticThreadsConfigurations, {
	channelId: snowflakeRequiredParser,
});
export const automaticThreadsConfigurationsInsertSchema = createInsertSchema(automaticThreadsConfigurations);
