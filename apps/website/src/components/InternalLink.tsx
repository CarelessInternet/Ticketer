import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function InternalLink({
	children,
	className,
	href,
	...properties
}: PropsWithChildren<{ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>>) {
	return (
		<Link
			className={cn('text-blue-600 hover:underline dark:text-blue-500', className)}
			target="_blank"
			href={href}
			{...properties}
		>
			{children}
		</Link>
	);
}
