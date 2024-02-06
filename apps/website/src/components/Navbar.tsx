'use client';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { HTMLAttributes, PropsWithChildren } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import NextLink from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

function ThemeSwitcher() {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="duration-0 hover:text-cyan-400 focus:text-cyan-400">
					<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => {
						setTheme('light');
					}}
				>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setTheme('dark');
					}}
				>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setTheme('system');
					}}
				>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface LinkProperties extends HTMLAttributes<HTMLElement> {
	href: string;
}

function Link({ children, className, href }: PropsWithChildren<LinkProperties>) {
	const isActive = usePathname() === href;

	return (
		<NextLink href={href} legacyBehavior passHref>
			<NavigationMenuLink className={cn(navigationMenuTriggerStyle(), className)} active={isActive}>
				{children}
			</NavigationMenuLink>
		</NextLink>
	);
}

function ListItem({ children, href, title }: PropsWithChildren<{ href: string; title: string }>) {
	return (
		<li>
			<Link href={href} className="h-full w-full p-2">
				<div className="block space-y-1">
					<h1 className="text-base font-medium leading-none">{title}</h1>
					<p className="text-sm leading-snug">{children}</p>
				</div>
			</Link>
		</li>
	);
}

export default function Navbar({ className, ...properties }: HTMLAttributes<HTMLElement>) {
	// Documentation:
	//		Self-Host, Commands
	// Legal:
	//		Privacy Policy, Terms of Service
	// Buttons
	//		Invite, Theme Switch

	return (
		<header className={cn(className)} {...properties}>
			<nav className="flex items-center border-b py-2">
				<div className="mx-8 flex flex-1 justify-around sm:mx-24 md:mx-32 lg:mx-48">
					<NavigationMenu className="max-w-none justify-start">
						<NavigationMenuList>
							<NavigationMenuItem className="flex flex-1 flex-row items-center space-x-2">
								<Image
									src="/favicon.ico"
									alt="favicon"
									width={48}
									height={48}
									className="hidden rounded-full sm:block"
								/>
								<Link href="/">Ticketer</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<NavigationMenu className="max-w-none justify-center">
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger>Documentation</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[300px] gap-3 px-2 py-4 md:w-[400px]">
										<ListItem href="/docs/self-hosting" title="Self-Hosting">
											Learn how to self-host the Ticketer bot on any computer that supports Docker.
										</ListItem>
										<ListItem href="/docs/commands" title="Commands">
											View some of the most popular and important commands in Ticketer.
										</ListItem>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<div className="flex flex-1 items-center justify-end">
						<ThemeSwitcher />
					</div>
				</div>
			</nav>
		</header>
	);
}
