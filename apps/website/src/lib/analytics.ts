import { environment } from '@ticketer/env/website';
import { Umami, type UmamiOptions, type UmamiPayload } from '@umami/node';
import type { Route } from 'next';

function analyticsUrl(request: string) {
	const url = new URL(request);

	return `${url.pathname}${url.search}`;
}

export function analyticsTrack({
	userAgent,
	...payload
}: Required<Pick<UmamiPayload, 'referrer' | 'title' | 'url'>> & { userAgent: UmamiOptions['userAgent'] }) {
	if (!environment.NEXT_PUBLIC_UMAMI_ID || !environment.NEXT_PUBLIC_UMAMI_URL) {
		return;
	}

	const umami = new Umami({
		hostUrl: environment.NEXT_PUBLIC_UMAMI_URL,
		userAgent,
		websiteId: environment.NEXT_PUBLIC_UMAMI_ID,
	});

	payload.url = analyticsUrl(payload.url);
	// https://github.com/umami-software/node/blob/master/index.ts#L65
	umami?.track(payload satisfies Omit<UmamiPayload, 'website'>).catch((error) => {
		console.error('Umami analytics track error:', error);
	});
}

export function UTM({ medium, route, content }: { route: Route; medium: string; content?: string }) {
	const searchParams = new URLSearchParams();
	searchParams.set('utm_source', 'ticketer-website');
	searchParams.set('utm_medium', medium);

	if (content) {
		searchParams.set('utm_content', content);
	}

	return `${route}?${searchParams.toString()}` as Route;
}
