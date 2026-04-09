import { headers } from 'next/headers';
import { NextResponse, userAgent } from 'next/server';
import { analyticsTrack } from '@/lib/analytics';

export async function GET(request: Request) {
	analyticsTrack({
		referrer: request.referrer,
		title: 'Link - Discord Support Server',
		url: request.url,
		userAgent: userAgent({ headers: await headers() }).ua,
	});

	return NextResponse.redirect('https://discord.gg/9FHagm6343');
}
