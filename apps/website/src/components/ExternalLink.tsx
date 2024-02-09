import type { PropsWithChildren } from 'react';

export default function ExternalLink({ children, href }: PropsWithChildren<{ href: string }>) {
	return (
		<a
			className="text-blue-600 hover:underline dark:text-blue-500"
			target="_blank"
			href={href}
			rel="noopener noreferrer"
		>
			{children}
		</a>
	);
}
