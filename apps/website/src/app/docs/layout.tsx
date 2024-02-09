import type { PropsWithChildren } from 'react';
import { Toaster } from '@/components/ui/toaster';

export default function Layout({ children }: PropsWithChildren) {
	return (
		<main className="mx-4 pb-16 sm:mx-16 md:mx-32 lg:mx-40 xl:mx-48">
			<div className="flex flex-col space-y-12 pt-4">{children}</div>
			<Toaster />
		</main>
	);
}
