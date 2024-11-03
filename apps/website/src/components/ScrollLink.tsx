'use client';

import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { type WithRequired, cn } from '@/lib/utils';
import InternalLink from './InternalLink';
import { usePathname } from '@/i18n/routing';

export default function ScrollLink({
	children,
	className,
	target,
	...properties
}: PropsWithChildren<WithRequired<AnchorHTMLAttributes<HTMLAnchorElement>, 'target'>>) {
	const pathname = usePathname();

	return (
		<InternalLink
			href={`${pathname}#${target}`}
			target="_self"
			id={target}
			tabIndex={0}
			className={cn('text-foreground dark:text-foreground text-2xl font-bold sm:text-3xl', className)}
			{...properties}
		>
			{children}
		</InternalLink>
	);
}
