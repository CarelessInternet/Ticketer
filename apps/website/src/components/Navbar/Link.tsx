'use client';

import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { NavigationMenuLink, navigationMenuTriggerStyle } from '../ui/navigation-menu';
import { type WithRequired, cn } from '@/lib/utils';
import { Link as LocalisedLink } from '@/i18n/routing';
import { usePathname } from '@/i18n/routing';

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
