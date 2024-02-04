'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export default function ThemeProvider({ children, ...properties }: ThemeProviderProps) {
	return <NextThemesProvider {...properties}>{children}</NextThemesProvider>;
}
