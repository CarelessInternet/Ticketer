'use client';

import type { HTMLAttributes, PropsWithChildren } from 'react';
import InternalLink from './InternalLink';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface LinkProperties extends HTMLAttributes<HTMLElement> {
	target: string;
}

export default function ScrollLink({ children, className, target, ...properties }: PropsWithChildren<LinkProperties>) {
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
