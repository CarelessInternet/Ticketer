import type { PropsWithChildren } from 'react';

export default function Divider({ children }: PropsWithChildren) {
	return <div className="flex flex-col gap-2">{children}</div>;
}
