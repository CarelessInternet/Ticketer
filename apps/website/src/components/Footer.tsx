import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function Footer({ className, ...properties }: HTMLAttributes<HTMLElement>) {
	return (
		<footer className={cn('text-muted-foreground text-center', className)} {...properties}>
			<hr />
			<p className="mt-4">Released under the Apache-2.0 License.</p>
			<p className="mb-4">Copyright © Ticketer</p>
		</footer>
	);
}
