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
			// @ts-expect-error: Not sure how to combat this type error.
			href={`${pathname}#${target}`}
			target="_self"
			id={target}
			tabIndex={0}
			className={cn('text-inherit!', className)}
			{...properties}
		>
			<h2 className="text-foreground dark:text-foreground text-2xl font-bold hover:underline sm:text-3xl">
				{children}
			</h2>
		</InternalLink>
	);
}
