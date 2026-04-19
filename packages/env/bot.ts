import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const environment = createEnv({
	server: {
		npm_package_version: z.string(),
		NODE_ENV: z.union([z.literal('development'), z.literal('production')]),
		DISCORD_APPLICATION_ID: z.string().min(17),
		DISCORD_BOT_TOKEN: z.string(),
		DISCORD_GUILD_ID: z.string().min(17),
		DISCORD_OWNER_ID: z.string().min(17),
		// z.url instead of z.httpUrl to allow ports in the URL for e.g. localhost.
		WEBSITE_URL: z.url({ protocol: /^https?$/ }).optional(),
	},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
});
