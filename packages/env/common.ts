import { z } from 'zod/v4';

export const common = {
	npm_package_version: z.string(),
	NODE_ENV: z.enum(['development', 'production']).default('development'),
};
