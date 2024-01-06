import { customType, varchar } from 'drizzle-orm/mysql-core';

// https://orm.drizzle.team/docs/custom-types#examples
export const jsonWithParsing = <Data>(name: string) =>
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

export const baseTicketConfiguration = {
	managers: jsonWithParsing('managers').$type<string[]>().default([]),
	openingMessageTitle: varchar('openingMessageTitle', { length: 100 }),
	openingMessageDescription: varchar('openingMessageDescription', { length: 500 }),
};
