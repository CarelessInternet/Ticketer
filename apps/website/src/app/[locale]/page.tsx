import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import InternalLink from '@/components/InternalLink';
import type { Locale } from 'next-intl';
import { Plus } from 'lucide-react';

export default async function Home({ params }: PageProps<'/[locale]'>) {
	const { locale } = await params;

	setRequestLocale(locale as Locale);

	const t = await getTranslations('pages.index');

	return (
		<main className="flex flex-col items-center">
			<section className="flex h-[79vh] flex-col justify-center">
				<div className="inline-block pb-4 text-center">
					<h1 className="inline bg-linear-to-r from-indigo-400 to-cyan-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
						{t('heading.1')}{' '}
					</h1>
					<h1 className="inline bg-linear-to-r from-cyan-500 to-teal-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent underline decoration-green-400 decoration-wavy">
						{t('heading.2')}
					</h1>
					<h1 className="inline bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-teal-400">.</h1>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" asChild className="w-fit gap-x-1">
						<InternalLink href="/links/discord/invite" noLocalisation noDefaultStyles prefetch={false}>
							<Plus />
							{t('button')}
						</InternalLink>
					</Button>
				</div>
			</section>
		</main>
	);
}
