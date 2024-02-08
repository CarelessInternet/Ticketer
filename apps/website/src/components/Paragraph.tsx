import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export default function Paragraph({ children, className }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
	return <p className={cn('pb-2 text-base sm:text-lg', className)}>{children}</p>;
}
