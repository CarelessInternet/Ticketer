import * as schema from './schema';
import { DB_URL, usingPlanetscale } from './config';
import { dirname, resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate as drizzleMigrate } from 'drizzle-orm/mysql2/migrator';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({ uri: DB_URL, supportBigNumbers: true });

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
export * from './schema';
