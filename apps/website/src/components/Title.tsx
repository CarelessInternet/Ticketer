import type { PropsWithChildren } from 'react';

export default function Title({ children }: PropsWithChildren) {
	return <h1 className="text-3xl font-bold sm:text-4xl">{children}</h1>;
}
