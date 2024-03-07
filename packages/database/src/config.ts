import { environment } from '@ticketer/env/database';

export default {
	host: environment.DB_HOST,
	port: environment.DB_PORT,
	database: environment.DB_DATABASE,
	user: environment.DB_USER,
	password: environment.DB_PASSWORD,
} as const;
