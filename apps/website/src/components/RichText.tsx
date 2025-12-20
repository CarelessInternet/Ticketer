import type { ReactNode } from 'react';
import InternalLink from './InternalLink';

// These tags are available.
type Tag = 'b' | 'i' | 'linkSupport';

interface Properties {
	children(tags: Record<Tag, (chunks: ReactNode) => ReactNode>): ReactNode;
}

export default function RichText({ children }: Properties) {
	return children({
		b: (chunk: ReactNode) => <b>{chunk}</b>,
		i: (chunk: ReactNode) => <i>{chunk}</i>,
		linkSupport: (chunk: ReactNode) => (
			<InternalLink href="/links/discord/support" noLocalisation prefetch={false}>
				{chunk}
			</InternalLink>
		),
	});
}
