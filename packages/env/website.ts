import { createEnv } from '@t3-oss/env-nextjs';
import z from 'zod';

export const environment = createEnv({
	client: {
		NEXT_PUBLIC_SITE_URL: z.url(),
		NEXT_PUBLIC_UMAMI_ID: z.string().min(1).optional(),
		NEXT_PUBLIC_UMAMI_URL: z.url().optional(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_UMAMI_ID: process.env.NEXT_PUBLIC_UMAMI_ID,
		NEXT_PUBLIC_UMAMI_URL: process.env.NEXT_PUBLIC_UMAMI_URL,
	},
});
