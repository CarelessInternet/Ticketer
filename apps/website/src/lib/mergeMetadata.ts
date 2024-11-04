import type { Metadata } from 'next/types';

const baseURL = new URL(
	process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? String(2027)}`,
);

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
		title: `Ticketer - ${title}`,
		description: description,
		openGraph: {
			siteName: 'Ticketer',
			locale: locale.replaceAll('-', '_'),
			type: 'website',
			images: [
				{
					url: new URL('/favicon.ico', baseURL),
					width: 512,
					height: 512,
					alt: 'Ticketer logo',
				},
			],
			url: baseURL,
		},
		metadataBase: baseURL,
	};
}
