import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export default function ExternalLink({
	children,
	className,
	href,
	noDefaultStyles = false,
}: PropsWithChildren<{ noDefaultStyles?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>>) {
	return (
		<a
			className={cn(noDefaultStyles ? '' : 'text-blue-600 hover:underline dark:text-blue-500', className)}
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			{children}
		</a>
	);
}
