import { createEnv } from '@t3-oss/env-core';
import { env } from 'node:process';
import { z } from 'zod';

export const environment = createEnv({
	server: {
		DB_HOST: z.string().default('localhost'),
		DB_PORT: z.coerce.number().default(3306),
		DB_DATABASE: z.string().default('Ticketer'),
		DB_USER: z.string().default('root'),
		DB_PASSWORD: z.string().default(''),
		USING_PLANETSCALE: z
			.string()
			.refine((s) => s === 'true' || s === 'false')
			.transform((s) => s === 'true')
			.default('false'),
	},
	runtimeEnv: env,
	emptyStringAsUndefined: true,
});
