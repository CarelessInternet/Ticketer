import type { PropsWithChildren, ReactNode } from 'react';
import { UTM } from '@/lib/analytics';
import InternalLink from './InternalLink';

// These tags are available.
type Tag = 'b' | 'i';

interface Properties {
	children(tags: Record<Tag, (chunks: ReactNode) => ReactNode>): ReactNode;
}

export function UTMLinkSupport({
	medium,
	children,
	content,
}: PropsWithChildren<Omit<Parameters<typeof UTM>[0], 'route'>>) {
	return (
		<InternalLink href={UTM({ route: '/links/discord/support', medium, content })} noLocalisation prefetch={false}>
			{children}
		</InternalLink>
	);
}

export default function RichText({ children }: Properties) {
	return children({
		b: (chunk: ReactNode) => <b>{chunk}</b>,
		i: (chunk: ReactNode) => <i>{chunk}</i>,
	});
}
