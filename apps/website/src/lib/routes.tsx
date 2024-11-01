import { Code, Cookie, Globe, Scale, Server, Terminal } from 'lucide-react';
import type { JSX } from 'react';

interface Route {
	description: string;
	href: string;
	icon: JSX.Element;
	title: string;
}

interface RouteMenu {
	documentation: Route[];
	legal: Route[];
}

export const internalRoutes = {
	documentation: [
		{
			description: 'View some of the most popular and important commands in Ticketer.',
			href: '/docs/commands',
			icon: <Terminal />,
			title: 'Commands',
		},
		{
			description: 'Learn how to self-host the Ticketer bot on any computer that supports Docker.',
			href: '/docs/self-hosting',
			icon: <Server />,
			title: 'Self-Hosting',
		},
		{
			description: 'Instructions on how to develop the Ticketer bot.',
			href: '/docs/development',
			icon: <Code />,
			title: 'Development',
		},
		{
			description: 'Instructions on how to add language translations to the Ticketer bot.',
			href: '/docs/contributing-to-localisation',
			icon: <Globe />,
			title: 'Contributing to Localisation',
		},
	],
	legal: [
		{
			description: 'Read the privacy policy for Ticketer.',
			href: '/legal/privacy-policy',
			icon: <Cookie />,
			title: 'Privacy Policy',
		},
		{
			description: 'Read the terms of service for Ticketer.',
			href: '/legal/terms-of-service',
			icon: <Scale />,
			title: 'Terms of Service',
		},
	],
} satisfies RouteMenu;
