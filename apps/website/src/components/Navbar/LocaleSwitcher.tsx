'use client';

import { GB, SE, US } from 'country-flag-icons/react/3x2';
import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type Locale, usePathname, useRouter } from '@/i18n/routing';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export default function LocaleSwitcher({ content }: { content: string }) {
	const pathname = usePathname();
	const router = useRouter();
	const t = useTranslations('layout.navbar.items.locale');

	function goToLocale(locale: Locale) {
		router.replace(pathname, { locale });
	}

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
								<Languages />
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
								goToLocale('en-GB');
							}}
						>
							<GB className="mr-2 h-4 w-4" />
							{t('toggle.en-GB')}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								goToLocale('en-US');
							}}
						>
							<US className="mr-2 h-4 w-4" />
							{t('toggle.en-US')}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								goToLocale('sv-SE');
							}}
						>
							<SE className="mr-2 h-4 w-4" />
							{t('toggle.sv-SE')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</Tooltip>
		</TooltipProvider>
	);
}
