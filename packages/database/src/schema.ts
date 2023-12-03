import {
	bigint,
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

const snowflake = (name: string) => bigint(name, { mode: 'bigint', unsigned: true });

export const welcomeAndFarewell = mysqlTable('welcomeAndFarewell', {
	guildId: snowflake('guildId').primaryKey(),
	welcomeChannelId: snowflake('welcomeChannelId').unique(),
	welcomeTitle: varchar('welcomeTitle', { length: 100 }),
	welcomeMessage: varchar('welcomeMessage', { length: 500 }),
	welcomeNewMemberRoles: jsonWithParsing('welcomeNewMemberRoles').$type<string[]>().default([]),
	welcomeEnabled: boolean('welcomeEnabled').notNull().default(true),
	farewellChannelId: snowflake('farewellChannelId').unique(),
	farewellTitle: varchar('farewellTitle', { length: 100 }),
	farewellMessage: varchar('farewellMessage', { length: 500 }),
	farewellEnabled: boolean('farewellEnabled').notNull().default(true),
});

export const ticketThreadsConfiguration = mysqlTable('ticketThreadsConfiguration', {
	guildId: snowflake('guildId').primaryKey(),
	activeTickets: tinyint('activeTickets', { unsigned: true }).notNull().default(1),
	threadNotifications: boolean('threadNotifications').notNull().default(false),
});

export const ticketThreadsCategories = mysqlTable(
	'ticketThreadsCategories',
	{
		id: int('id', { unsigned: true }).autoincrement().primaryKey(),
		guildId: snowflake('guildId').notNull(),
		categoryEmoji: char('categoryEmoji'),
		categoryTitle: varchar('categoryTitle', { length: 100 }),
		categoryDescription: varchar('categoryDescription', { length: 100 }),
		channelId: snowflake('channelId'),
		logsChannelId: snowflake('logsChannelId'),
		managers: jsonWithParsing('managers').$type<string[]>().default([]),
		privateThreads: boolean('privateThreads').notNull().default(true),
		ticketTitle: varchar('ticketTitle', { length: 100 }),
		ticketDescription: varchar('ticketDescription', { length: 500 }),
	},
	(table) => ({
		guildIdIndex: index('guildId_index').on(table.guildId),
		references: foreignKey({
			columns: [table.guildId],
			foreignColumns: [ticketThreadsConfiguration.guildId],
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

/**
 * The Planned Tables:
 * 	Welcome and Farewell Config
 * 	Ticket Config (Threads)
 * 	Tickets (Threads)
 * 	Ticket Config (Forums)
 * 	Tickets (Forums)
 */
