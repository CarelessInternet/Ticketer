import type { PropsWithChildren } from 'react';

export default function Title({ children }: PropsWithChildren) {
	return <h1 className="font-bold text-3xl sm:text-4xl">{children}</h1>;
}
