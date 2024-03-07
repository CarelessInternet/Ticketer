import type { Config } from 'drizzle-kit';
import config from './src/config';

export default {
	breakpoints: true,
	verbose: true,
	strict: true,
	driver: 'mysql2',
	schema: './src/schema.ts',
	out: './migrations',
	dbCredentials: config,
} satisfies Config;
