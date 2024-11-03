import { Button } from '@/components/ui/button';
import InternalLink from '@/components/InternalLink';
import type { PageProperties } from '@/i18n/routing';
import { Plus } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';

export default async function Home({ params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<main className="flex flex-col items-center">
			<section className="flex h-[79vh] flex-col justify-center">
				<div className="inline-block pb-4 text-center">
					<h1 className="inline bg-gradient-to-r from-indigo-400 to-cyan-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
						Your Discord bot for{' '}
					</h1>
					<h1 className="inline bg-gradient-to-r from-cyan-500 to-teal-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent underline decoration-green-400 decoration-wavy">
						tickets with threads
					</h1>
					<h1 className="inline bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-teal-400">.</h1>
				</div>
				<div className="flex justify-center">
					<Button variant="outline" asChild className="w-fit">
						<InternalLink href="/links/discord/invite" noLocalisation noDefaultStyles>
							<Plus />
							Invite to your Discord Server
						</InternalLink>
					</Button>
				</div>
			</section>
		</main>
	);
}
