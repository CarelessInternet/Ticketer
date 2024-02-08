import Divider from './Divider';
import Header from './Header';
import type { PropsWithChildren } from 'react';

export default function SectionDivider({ children, header }: PropsWithChildren<{ header: string }>) {
	return (
		<div className="pt-2">
			<Divider>
				<Header>{header}</Header>
				{children}
			</Divider>
		</div>
	);
}
