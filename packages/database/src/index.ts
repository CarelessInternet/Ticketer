import * as schema from './schema';
import config from './config';
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate as drizzleMigrate } from 'drizzle-orm/mysql2/migrator';
import { fileURLToPath } from 'node:url';

const connection = await createConnection({
	supportBigNumbers: true,
	...config,
});

export const database = drizzle(connection, {
	schema,
	mode: 'default',
});

export function migrate() {
	return drizzleMigrate(database, { migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)) });
}

export * from 'drizzle-orm';
export { type MySqlSelect, unionAll } from 'drizzle-orm/mysql-core';
export * from './schema';
export { ThreadTicketActionsPermissionBitField } from './utils/ThreadTicketActionsPermissionBitField';
