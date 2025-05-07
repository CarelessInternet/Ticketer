'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';

const Toaster = ({ ...properties }: ToasterProps) => {
	const { theme = 'system' } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className="toaster group"
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
				} as React.CSSProperties
			}
			{...properties}
		/>
	);
};

export { Toaster };
