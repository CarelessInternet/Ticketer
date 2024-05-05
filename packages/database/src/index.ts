import * as schema from './schema';
import config from './config';
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate as drizzleMigrate } from 'drizzle-orm/mysql2/migrator';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const connection = await createConnection({
	supportBigNumbers: true,
	...config,
});

export const database = drizzle(connection, {
	schema,
	mode: 'default',
});

export function migrate() {
	const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
	const migrationsFolder = path.resolve(currentDirectory, '../migrations');

	return drizzleMigrate(database, { migrationsFolder });
}

export * from 'drizzle-orm';
export { type MySqlSelect, unionAll } from 'drizzle-orm/mysql-core';
export * from './schema';
