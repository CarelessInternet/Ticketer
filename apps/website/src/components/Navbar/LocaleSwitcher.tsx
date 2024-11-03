'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { GB, SE, US } from 'country-flag-icons/react/3x2';
import { type Locale, usePathname, useRouter } from '@/i18n/routing';
import { Button } from '../ui/button';
import { Languages } from 'lucide-react';

export default function LocaleSwitcher({ translations }: { translations: Record<Locale, string> }) {
	const pathname = usePathname();
	const router = useRouter();

	function goToLocale(locale: Locale) {
		router.replace(pathname, { locale });
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="duration-0 dark:hover:text-cyan-400 dark:focus:text-cyan-400">
					<Languages />
					<span className="sr-only">Change locale</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => {
						goToLocale('en-GB');
					}}
				>
					<GB className="mr-2 h-4 w-4" />
					{translations['en-GB']}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						goToLocale('en-US');
					}}
				>
					<US className="mr-2 h-4 w-4" />
					{translations['en-US']}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						goToLocale('sv-SE');
					}}
				>
					<SE className="mr-2 h-4 w-4" />
					{translations['sv-SE']}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
