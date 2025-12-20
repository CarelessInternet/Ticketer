import '../globals.css';
import { environment } from '@ticketer/env/website';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { hasLocale, type Locale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { ViewTransition } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { routing } from '@/i18n/routing';
import { mergeMetadata } from '@/lib/mergeMetadata';
import { cn } from '@/lib/utils';

const font = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({
		locale: locale as Locale,
		namespace: 'pages.index.metadata',
	});

	return mergeMetadata({
		description: t('description'),
		locale,
		title: t('title'),
	});
}

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	// Enable static rendering.
	// https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#static-rendering
	// https://github.com/amannn/next-intl/issues/663
	setRequestLocale(locale);

	return (
		<html lang={locale} suppressHydrationWarning>
			{environment.NEXT_PUBLIC_UMAMI_ID && environment.NEXT_PUBLIC_UMAMI_URL && (
				<Script
					defer
					src={new URL('/script.js', environment.NEXT_PUBLIC_UMAMI_URL).toString()}
					data-website-id={environment.NEXT_PUBLIC_UMAMI_ID}
				/>
			)}
			<body className={cn('min-h-screen bg-background font-sans antialiased', font.variable)}>
				<NextIntlClientProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						<ViewTransition>
							<div className="flex h-screen flex-col">
								<Navbar className="mb-4" />
								<div className="mx-8 grow sm:mx-16">{children}</div>
								<Footer className="mt-8" />
							</div>
						</ViewTransition>
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
