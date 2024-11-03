import type { PropsWithChildren } from 'react';

export const locales = ['en-GB', 'en-US', 'sv-SE'] as const;

export type Locale = (typeof locales)[number];

export type PageProperties<T = object> = PropsWithChildren<T & { params: Promise<{ locale: string }> }>;
