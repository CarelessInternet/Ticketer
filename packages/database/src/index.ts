import * as schema from './schema';
import { DB_URL, usingPlanetscale } from './config';
import { dirname, resolve } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate as drizzleMigrate } from 'drizzle-orm/mysql2/migrator';
import { fileURLToPath } from 'node:url';

const connection = await createConnection({ uri: DB_URL, supportBigNumbers: true });

export const database = drizzle(connection, {
	schema,
	mode: usingPlanetscale ? 'planetscale' : 'default',
});

export function migrate() {
	const currentDirectory = dirname(fileURLToPath(import.meta.url));
	const migrationsFolder = resolve(currentDirectory, '../migrations');

	return drizzleMigrate(database, { migrationsFolder });
}

export * from 'drizzle-orm';
export { type MySqlSelect, unionAll } from 'drizzle-orm/mysql-core';
export * from './schema';
