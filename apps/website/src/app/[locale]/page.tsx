import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import InternalLink from '@/components/InternalLink';
import type { PageProperties } from '@/i18n/routing';
import { Plus } from 'lucide-react';

export default async function Home({ params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations('pages.index');

	return (
		<main className="flex flex-col items-center">
			<section className="flex h-[79vh] flex-col justify-center">
				<div className="inline-block pb-4 text-center">
					<h1 className="inline bg-gradient-to-r from-indigo-400 to-cyan-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
						{t('heading.1')}{' '}
					</h1>
					<h1 className="inline bg-gradient-to-r from-cyan-500 to-teal-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent underline decoration-green-400 decoration-wavy">
						{t('heading.2')}
					</h1>
					<h1 className="inline bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-teal-400">.</h1>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" asChild className="w-fit">
						<InternalLink href="/links/discord/invite" noLocalisation noDefaultStyles>
							<Plus />
							{t('button')}
						</InternalLink>
					</Button>
				</div>
			</section>
		</main>
	);
}
