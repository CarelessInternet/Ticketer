import type { Config } from 'drizzle-kit';
import { DB_URL } from './src/config';

export default {
	verbose: true,
	strict: true,
	driver: 'mysql2',
	schema: './src/schema.ts',
	out: './migrations',
	dbCredentials: { uri: DB_URL },
} satisfies Config;
