import { createPool } from 'mysql2/promise';

const pool = createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	port: parseInt(process.env.DB_PORT) || 3306,
	connectionLimit: 100,
	supportBigNumbers: true,
	bigNumberStrings: true
});

/**
 * Gets a connection to mysql and executes given query
 */
export const execute = async (query: string, parameters?: any[]) => {
	const conn = await pool.getConnection();
	const results = await conn.execute(query, parameters);
	conn.release();

	return results;
};
