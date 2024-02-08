import type { PropsWithChildren } from 'react';

export default function Header({ children }: PropsWithChildren) {
	return <h3 className="text-lg font-bold sm:text-xl">{children}</h3>;
}
