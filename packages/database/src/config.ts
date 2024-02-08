import { environment } from '@ticketer/env/database';

const config = {
	host: environment.DB_HOST,
	port: environment.DB_PORT,
	database: environment.DB_DATABASE,
	user: environment.DB_USER,
	password: environment.DB_PASSWORD,
};

export const usingPlanetscale = environment.USING_PLANETSCALE;

// This is a URL so that the schema can be pushed to PlanetScale using drizzle-kit.
export const DB_URL = `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}${
	usingPlanetscale ? '?ssl={"rejectUnauthorized":true}' : ''
}`;
