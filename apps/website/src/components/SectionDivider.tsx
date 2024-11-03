import Divider from './Divider';
import Heading from './Heading';
import type { PropsWithChildren } from 'react';

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
