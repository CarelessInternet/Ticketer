import type { HTMLAttributes, PropsWithChildren } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LinkProperties extends HTMLAttributes<HTMLElement> {
	href: string;
}

export default function ScrollLink({ children, className, href, ...properties }: PropsWithChildren<LinkProperties>) {
	return (
		<Link href={href} className={cn('text-2xl font-bold hover:underline sm:text-3xl', className)} {...properties}>
			{children}
		</Link>
	);
}
