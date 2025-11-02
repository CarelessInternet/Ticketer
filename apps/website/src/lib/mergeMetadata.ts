import type { Metadata } from 'next/types';
import { environment } from '@ticketer/env/website';

export function mergeMetadata({
	description,
	locale,
	title,
}: {
	description: string;
	locale: string;
	title: string;
}): Metadata {
	return {
		title: `${title} - Ticketer`,
		description: description,
		openGraph: {
			siteName: 'Ticketer',
			locale: locale.replaceAll('-', '_'),
			type: 'website',
			images: [
				{
					url: new URL('/favicon.ico', environment.NEXT_PUBLIC_SITE_URL),
					width: 512,
					height: 512,
					alt: 'Ticketer logo.',
				},
			],
			url: environment.NEXT_PUBLIC_SITE_URL,
		},
		metadataBase: environment.NEXT_PUBLIC_SITE_URL,
	};
}
