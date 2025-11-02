import type { ComponentProps, PropsWithChildren } from 'react';
import { Link } from '@/i18n/routing';
// eslint-disable-next-line no-restricted-imports
import NextLink from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils';

export default function InternalLink({
	children,
	className,
	noLocalisation = false,
	noDefaultStyles = false,
	...properties
}: PropsWithChildren<
	{
		href: Route;
		noLocalisation?: boolean;
		noDefaultStyles?: boolean;
		prefetch?: ComponentProps<typeof NextLink>['prefetch'];
	} & ComponentProps<typeof NextLink & typeof Link>
>) {
	const Component = noLocalisation ? NextLink : Link;

	return (
		<Component
			className={cn(noDefaultStyles ? '' : 'text-blue-600 hover:underline dark:text-blue-500', className)}
			target="_blank"
			{...properties}
		>
			{children}
		</Component>
	);
}
