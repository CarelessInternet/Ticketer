import type { PropsWithChildren } from 'react';

export default function Divider({ children }: PropsWithChildren) {
	return <div className="space-y-2">{children}</div>;
}
