import { bigint, boolean, customType, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

// https://orm.drizzle.team/docs/custom-types#examples
const jsonWithParsing = <Data>(name: string) =>
	customType<{ data: Data; driverData: string }>({
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
	})(name);

export const welcomeAndFarewell = mysqlTable('welcomeAndFarewell', {
	guildId: bigint('guildId', { mode: 'bigint', unsigned: true }).notNull().primaryKey(),
	welcomeChannelId: bigint('welcomeChannelId', { mode: 'bigint', unsigned: true }).unique(),
	welcomeTitle: varchar('welcomeTitle', { length: 100 }),
	welcomeMessage: varchar('welcomeMessage', { length: 500 }),
	welcomeNewMemberRoles: jsonWithParsing('welcomeNewMemberRoles').$type<string[]>().notNull().default([]),
	welcomeEnabled: boolean('welcomeEnabled').notNull().default(true),
	farewellChannelId: bigint('farewellChannelId', { mode: 'bigint', unsigned: true }).unique(),
	farewellTitle: varchar('farewellTitle', { length: 100 }),
	farewellMessage: varchar('farewellMessage', { length: 500 }),
	farewellEnabled: boolean('farewellEnabled').notNull().default(true),
});

/**
 * The Planned Tables:
 * 	Welcome and Farewell Config
 * 	Ticket Config (Threads)
 * 		Ticket Categories Config
 * 	Tickets (Threads)
 * 	Ticket Config (Forums)
 * 	Tickets (Forums)
 * 	(WILL NOT IMPLEMENT) Feedback Config
 */
