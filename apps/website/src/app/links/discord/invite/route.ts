import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export function GET() {
	return NextResponse.redirect(
		'https://discord.com/oauth2/authorize?client_id=880454049370083329&permissions=395137198096&integration_type=0&scope=applications.commands+bot',
	);
}
