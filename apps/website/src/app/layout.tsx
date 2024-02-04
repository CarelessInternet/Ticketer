import './globals.css';
import { DM_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ThemeProvider from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const font = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: 'Ticketer',
	description: 'The Discord bot for creating tickets with threads.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={cn('min-h-screen bg-background font-sans antialiased', font.variable)}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<Navbar />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
