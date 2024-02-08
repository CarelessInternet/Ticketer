import type { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
	return <main className="mx-4 pb-16 sm:mx-16 md:mx-32 lg:mx-40 xl:mx-48">{children}</main>;
}
