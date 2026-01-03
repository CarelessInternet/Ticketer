import { defineConfig } from 'drizzle-kit';
import config from './src/config';

export default defineConfig({
	breakpoints: true,
	dbCredentials: config,
	dialect: 'mysql',
	out: './migrations',
	schema: './src/schema.ts',
	strict: true,
	verbose: true,
});
