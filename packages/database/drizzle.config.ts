import { defineConfig } from 'drizzle-kit';
import config from './src/config';

export default defineConfig({
	dbCredentials: config,
	dialect: 'mysql',
	breakpoints: true,
	out: './migrations',
	schema: './src/schema.ts',
	strict: true,
	verbose: true,
});
