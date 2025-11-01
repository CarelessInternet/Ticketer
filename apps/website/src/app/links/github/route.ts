import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export function GET() {
	return NextResponse.redirect('https://github.com/CarelessInternet/Ticketer');
}
