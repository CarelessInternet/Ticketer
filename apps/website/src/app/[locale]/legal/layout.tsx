import type { PageProperties } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

export default async function Layout({ children, params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<main className="mx-4 pb-16 sm:mx-16 md:mx-32 lg:mx-40 xl:mx-48">
			<div className="flex flex-col space-y-12 pt-4">{children}</div>
		</main>
	);
}
