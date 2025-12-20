import type { PropsWithChildren } from 'react';

export default function Heading({ children }: PropsWithChildren) {
	return <h3 className="mt-8 font-bold text-lg sm:text-xl">{children}</h3>;
}
