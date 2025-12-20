import type { PropsWithChildren } from 'react';
import Divider from './Divider';
import Heading from './Heading';

export default function SectionDivider({ children, header }: PropsWithChildren<{ header: string }>) {
	return (
		<div className="pt-2">
			<Divider>
				<Heading>{header}</Heading>
				{children}
			</Divider>
		</div>
	);
}
