'use client';

import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { Link as LocalisedLink, usePathname } from '@/i18n/routing';
import { cn, type WithRequired } from '@/lib/utils';
import { NavigationMenuLink, navigationMenuTriggerStyle } from '../ui/navigation-menu';

export default function Link({
	children,
	className,
	href,
}: PropsWithChildren<WithRequired<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>>) {
	const isActive = usePathname() === href;

	return (
		<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), className)} active={isActive} asChild>
			<LocalisedLink href={href}>{children}</LocalisedLink>
		</NavigationMenuLink>
	);
}
