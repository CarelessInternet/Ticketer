import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { DM_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import type { PropsWithChildren } from 'react';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

const font = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const baseURL = new URL(
	process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? 2027}`,
);

export const metadata: Metadata = {
	title: 'Ticketer',
	description: 'The Discord bot for creating tickets with threads.',
	openGraph: {
		siteName: 'Ticketer',
		locale: 'en_GB',
		type: 'website',
		images: [
			{
				url: new URL('/favicon.ico', baseURL),
				width: 512,
				height: 512,
				alt: 'Ticketer logo',
			},
		],
	},
	metadataBase: baseURL,
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<body className={cn('bg-background min-h-screen font-sans antialiased', font.variable)}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<Navbar className="pb-4" />
					<div className="mx-8 sm:mx-16">{children}</div>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
