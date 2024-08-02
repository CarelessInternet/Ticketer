import config from './src/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dbCredentials: config,
	dialect: 'mysql',
	breakpoints: true,
	out: './migrations',
	schema: './src/schema.ts',
	strict: true,
	verbose: true,
});
