import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { Link } from '@/i18n/routing';
// eslint-disable-next-line no-restricted-imports
import NextLink from 'next/link';
import { cn } from '@/lib/utils';

export default function InternalLink({
	children,
	className,
	href,
	noLocalisation = false,
	noDefaultStyles = false,
	...properties
}: PropsWithChildren<
	{ href: string; noLocalisation?: boolean; noDefaultStyles?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>
>) {
	const Component = noLocalisation ? NextLink : Link;

	return (
		<Component
			className={cn(noDefaultStyles ? '' : 'text-blue-600 hover:underline dark:text-blue-500', className)}
			target="_blank"
			href={href}
			{...properties}
		>
			{children}
		</Component>
	);
}
