import InternalLink from './InternalLink';
import type { ReactNode } from 'react';

// These tags are available.
type Tag = 'b' | 'i' | 'linkSupport';

interface Properties {
	children(tags: Record<Tag, (chunks: ReactNode) => ReactNode>): ReactNode;
}

// eslint-disable-next-line @typescript-eslint/unbound-method
export default function RichText({ children }: Properties) {
	return children({
		b: (chunk: ReactNode) => <b>{chunk}</b>,
		i: (chunk: ReactNode) => <i>{chunk}</i>,
		linkSupport: (chunk: ReactNode) => (
			<InternalLink href="/links/discord/support" noLocalisation>
				{chunk}
			</InternalLink>
		),
	});
}
