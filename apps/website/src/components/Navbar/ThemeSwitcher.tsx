'use client';

import { useTheme } from '@wrksz/themes/client';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export default function ThemeSwitcher({ content }: { content: string }) {
	const { setTheme } = useTheme();
	const t = useTranslations('layout.navbar.items.theme');

	return (
		<TooltipProvider>
			<Tooltip>
				<DropdownMenu>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="duration-0 dark:focus:text-cyan-400 dark:hover:text-cyan-400"
							>
								<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
								<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
								<span className="sr-only">{t('change')}</span>
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent>
						<p>{content}</p>
					</TooltipContent>
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
			</Tooltip>
		</TooltipProvider>
	);
}
