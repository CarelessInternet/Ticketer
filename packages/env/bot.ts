import { common } from './common';
import { createEnv } from '@t3-oss/env-core';
import { env } from 'node:process';
import { z } from 'zod';

export const environment = createEnv({
	server: {
		...common,
		DISCORD_APPLICATION_ID: z.string().min(17),
		DISCORD_BOT_TOKEN: z.string(),
		DISCORD_GUILD_ID: z.string().min(17),
		DISCORD_OWNER_ID: z.string().min(17),
		DISCORD_SUPPORT_SERVER: z.string().url().includes('discord.gg').optional(),
		WEBSITE_URL: z.string().url().default('https://ticketer-careless.vercel.app'),
	},
	runtimeEnv: env,
	emptyStringAsUndefined: true,
});
