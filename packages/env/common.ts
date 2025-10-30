import { z } from 'zod';

export const common = {
	npm_package_version: z.string(),
	NODE_ENV: z.enum(['development', 'production']),
};
