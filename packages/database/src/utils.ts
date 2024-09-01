import { and, database, eq, ticketThreadsCategories } from '.';
import { customType, varchar } from 'drizzle-orm/mysql-core';
import { z } from 'zod';

// TODO: Change mode to 'string' when available: https://github.com/drizzle-team/drizzle-orm/issues/813
// const snowflake = (name: string) => bigint(name, { mode: 'bigint', unsigned: true });

type DiscordSnowflake = string;

export const snowflake = customType<{ data: DiscordSnowflake }>({
	dataType() {
		return 'bigint unsigned';
	},
	fromDriver: String,
	toDriver(value: DiscordSnowflake) {
		return value;
	},
});

const snowflakeParser = z.coerce.bigint().min(17n).transform(String);
export const snowflakeOptionalParser = snowflakeParser.optional();
export const snowflakeRequiredParser = snowflakeParser;

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

// Using structuredClone() does not work here.
export const baseTicketConfigurationNotNull = {
	managers: baseTicketConfiguration.managers,
	openingMessageTitle: varchar('openingMessageTitle', { length: 100 }).notNull(),
	openingMessageDescription: varchar('openingMessageDescription', { length: 500 }).notNull(),
};

export class ThreadTicketButtonsPermissionBitField {
	['constructor']!: typeof ThreadTicketButtonsPermissionBitField;

	public static Flags = {
		// key: 1 << n (n=0 at initial)
		RenameTitle: 1,
		Lock: 2,
		Close: 4,
		LockAndClose: 8,
		Delete: 16,
	} as const;

	public static All = Object.values(this.Flags).reduce((permissionBit, accumulator) => permissionBit | accumulator, 0);

	public static Default = this.All;

	public constructor(private bitfield = this.constructor.Default) {}

	public has(bit: number) {
		return (this.bitfield & bit) === bit;
	}

	public add(...bits: (typeof this.constructor.Flags)[keyof typeof this.constructor.Flags][]) {
		let total = 0;

		for (const bit of bits) {
			total |= bit;
		}

		this.bitfield |= total;
	}

	public remove(...bits: (typeof this.constructor.Flags)[keyof typeof this.constructor.Flags][]) {
		let total = 0;

		for (const bit of bits) {
			total |= bit;
		}

		this.bitfield &= ~total;
	}

	public async updateAuthorPermissions(
		categoryId: typeof ticketThreadsCategories.$inferSelect.id,
		guildId: DiscordSnowflake,
	) {
		database
			.update(ticketThreadsCategories)
			.set({ allowedAuthorButtons: this.bitfield })
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, guildId)));

		return this.bitfield;
	}
}
