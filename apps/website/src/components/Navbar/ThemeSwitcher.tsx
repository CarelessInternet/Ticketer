'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

export default function ThemeSwitcher() {
	const { setTheme } = useTheme();
	const t = useTranslations('layout.navbar.items.theme');

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="duration-0 dark:hover:text-cyan-400 dark:focus:text-cyan-400">
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span className="sr-only">{t('change')}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => {
						setTheme('light');
					}}
				>
					☀️ {t('toggle.light')}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setTheme('dark');
					}}
				>
					🌙 {t('toggle.dark')}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setTheme('system');
					}}
				>
					🖥️ {t('toggle.system')}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
