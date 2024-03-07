import * as schema from './schema';
import { dirname, resolve } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate as drizzleMigrate } from 'drizzle-orm/mysql2/migrator';
import { environment } from '@ticketer/env/database';
import { fileURLToPath } from 'node:url';

const connection = await createConnection({
	supportBigNumbers: true,
	host: environment.DB_HOST,
	port: environment.DB_PORT,
	database: environment.DB_DATABASE,
	user: environment.DB_USER,
	password: environment.DB_PASSWORD,
});

export const database = drizzle(connection, {
	schema,
	mode: 'default',
});

export function migrate() {
	const currentDirectory = dirname(fileURLToPath(import.meta.url));
	const migrationsFolder = resolve(currentDirectory, '../migrations');

	return drizzleMigrate(database, { migrationsFolder });
}

export * from 'drizzle-orm';
export { type MySqlSelect, unionAll } from 'drizzle-orm/mysql-core';
export * from './schema';
