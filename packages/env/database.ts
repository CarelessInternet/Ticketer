import { env } from 'node:process';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { common } from './common';

export const environment = createEnv({
	...common,
	server: {
		DB_HOST: z.string(),
		DB_PORT: z.coerce.number(),
		DB_DATABASE: z.string(),
		DB_USER: z.string(),
		DB_PASSWORD: z.string(),
	},
	runtimeEnv: env,
	emptyStringAsUndefined: true,
});
