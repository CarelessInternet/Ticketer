import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

export default async function Footer({ className, ...properties }: HTMLAttributes<HTMLElement>) {
	const t = await getTranslations('layout.footer');

	return (
		<footer className={cn('text-muted-foreground text-center', className)} {...properties}>
			<hr />
			<p className="mt-4">{t('license')}</p>
			<p className="mb-4">{t('copyright')}</p>
		</footer>
	);
}
