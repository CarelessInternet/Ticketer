import { getTranslations } from 'next-intl/server';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default async function Footer({ className, ...properties }: HTMLAttributes<HTMLElement>) {
	const t = await getTranslations('layout.footer');

	return (
		<footer className={cn('text-center text-muted-foreground', className)} {...properties}>
			<hr />
			<p className="mt-4">{t('license')}</p>
			<p className="mb-4">{t('copyright')}</p>
		</footer>
	);
}
