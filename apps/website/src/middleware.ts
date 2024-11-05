import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _vercel (analytics and speed insights)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - images (otherwise Next.js cannot optimise the images)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 * - link routes (which redirect and therefore do not need localisations)
		 */
		'/((?!api|_vercel|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt|links).*)',
	],
};
