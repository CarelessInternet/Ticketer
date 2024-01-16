import { customType, varchar } from 'drizzle-orm/mysql-core';

// TODO: change mode to 'string' when available: https://github.com/drizzle-team/drizzle-orm/issues/813
// const snowflake = (name: string) => bigint(name, { mode: 'bigint', unsigned: true });

export const snowflake = customType<{ data: string }>({
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

export const baseTicketConfigurationNotNull = {
	...baseTicketConfiguration,
	openingMessageTitle: baseTicketConfiguration.openingMessageTitle.notNull(),
	openingMessageDescription: baseTicketConfiguration.openingMessageDescription.notNull(),
};
