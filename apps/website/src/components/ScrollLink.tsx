'use client';

import type { HTMLAttributes, PropsWithChildren } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface LinkProperties extends HTMLAttributes<HTMLElement> {
	target: string;
}

export default function ScrollLink({ children, className, target, ...properties }: PropsWithChildren<LinkProperties>) {
	const pathname = usePathname();

	return (
		<Link
			href={`${pathname}#${target}`}
			className={cn('text-2xl font-bold hover:underline sm:text-3xl', className)}
			{...properties}
		>
			{children}
		</Link>
	);
}
