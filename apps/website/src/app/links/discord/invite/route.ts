import { headers } from 'next/headers';
import { NextResponse, userAgent } from 'next/server';
import { analyticsTrack } from '@/lib/analytics';

export async function GET(request: Request) {
	analyticsTrack({
		referrer: request.referrer,
		title: 'Link - Discord Bot Invite',
		url: request.url,
		userAgent: userAgent({ headers: await headers() }).ua,
	});

	return NextResponse.redirect(
		'https://discord.com/oauth2/authorize?client_id=880454049370083329&permissions=395137198096&integration_type=0&scope=applications.commands+bot',
	);
}
