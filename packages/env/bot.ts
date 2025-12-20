import { env } from 'node:process';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { common } from './common';

export const environment = createEnv({
	server: {
		...common,
		DISCORD_APPLICATION_ID: z.string().min(17),
		DISCORD_BOT_TOKEN: z.string(),
		DISCORD_GUILD_ID: z.string().min(17),
		DISCORD_OWNER_ID: z.string().min(17),
		DISCORD_SUPPORT_SERVER: z.url({ protocol: /^https?$/, hostname: /^discord\.gg$/ }).optional(),
		WEBSITE_URL: z.url(),
	},
	runtimeEnv: env,
	emptyStringAsUndefined: true,
});
