import type { PropsWithChildren } from 'react';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

const locales = ['en-GB', 'en-US', 'sv-SE'] as const;

export type Locale = (typeof locales)[number];

export interface PageProperties {
	params: Promise<{ locale: Locale }>;
}
export type LayoutProperties = PropsWithChildren<PageProperties>;

export const routing = defineRouting({
	locales,
	defaultLocale: 'en-GB',
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
