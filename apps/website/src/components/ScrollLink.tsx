'use client';

import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { usePathname } from '@/i18n/routing';
import { cn, type WithRequired } from '@/lib/utils';
import InternalLink from './InternalLink';

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
			<h2 className="font-bold text-2xl text-foreground hover:underline sm:text-3xl dark:text-foreground">
				{children}
			</h2>
		</InternalLink>
	);
}
