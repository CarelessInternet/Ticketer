import { common } from './common';
import { createEnv } from '@t3-oss/env-core';
import { env } from 'node:process';
import { z } from 'zod';

export const environment = createEnv({
	...common,
	server: {
		DB_HOST: z.string().default('ticketer-development-database'),
		DB_PORT: z.coerce.number().default(3307),
		DB_DATABASE: z.string().default('ticketer'),
		DB_USER: z.string().default('dev_container'),
		DB_PASSWORD: z.string().default('12345678'),
	},
	runtimeEnv: env,
	emptyStringAsUndefined: true,
});
