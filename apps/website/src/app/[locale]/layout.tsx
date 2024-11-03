import '../globals.css';
import { type LayoutProperties, type Locale, routing } from '@/i18n/routing';
import { Analytics } from '@vercel/analytics/react';
import { DM_Sans } from 'next/font/google';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

const font = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const baseURL = new URL(
	process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT ?? String(2027)}`,
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
		url: baseURL,
	},
	metadataBase: baseURL,
};

// eslint-disable-next-line unicorn/prevent-abbreviations
export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: LayoutProperties) {
	const { locale } = await params;

	if (!routing.locales.includes(locale as Locale)) {
		notFound();
	}

	// Enable static rendering.
	// https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#static-rendering
	// https://github.com/amannn/next-intl/issues/663
	setRequestLocale(locale);

	return (
		<html lang={locale.slice(0, 2)} suppressHydrationWarning>
			<body className={cn('bg-background min-h-screen font-sans antialiased', font.variable)}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<div className="flex h-screen flex-col">
						<Navbar className="mb-4" />
						<div className="mx-8 grow sm:mx-16">{children}</div>
						<Footer className="mt-8" />
					</div>
				</ThemeProvider>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
