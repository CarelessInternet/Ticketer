'use client';

import {
	Cookie,
	Github,
	Menu,
	MessageCircleQuestion,
	Moon,
	PlusCircle,
	Scale,
	Server,
	Sun,
	Terminal,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { HTMLAttributes, JSX, PropsWithChildren } from 'react';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
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
				<Button variant="outline" size="icon" className="duration-0 dark:hover:text-cyan-400 dark:focus:text-cyan-400">
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

function ListItem({
	children,
	href,
	icon,
	title,
}: PropsWithChildren<{ href: string; icon: JSX.Element; title: string }>) {
	return (
		<li>
			<Link href={href} className="h-full w-full justify-start p-2">
				<div className="flex flex-row">
					<div className="flex items-center pr-3">{icon}</div>
					<div className="block space-y-1">
						<h1 className="text-base font-medium leading-none">{title}</h1>
						<p className="text-sm leading-snug">{children}</p>
					</div>
				</div>
			</Link>
		</li>
	);
}

function TooltipLinkItem({ children, href, icon }: PropsWithChildren<{ href: string; icon: JSX.Element }>) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className="dark:hover:text-cyan-400 dark:focus:text-cyan-400" asChild>
					<Button variant="outline" size="icon" asChild>
						<a target="_blank" href={href}>
							{icon}
						</a>
					</Button>
				</TooltipTrigger>
				<TooltipContent>{children}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

const tooltipLinkItems = [
	{
		content: 'Invite to Discord Server',
		href: 'https://discord.com/api/oauth2/authorize?client_id=880454049370083329&permissions=395137133584&scope=bot+applications.commands',
		icon: <PlusCircle />,
	},
	{
		content: 'Discord Support Server',
		href: 'https://discord.gg/9FHagm6343',
		icon: <MessageCircleQuestion />,
	},
	{
		content: 'GitHub Repository',
		href: 'https://github.com/CarelessInternet/Ticketer',
		icon: <Github />,
	},
] as const;

export default function Navbar({ className, ...properties }: HTMLAttributes<HTMLElement>) {
	return (
		<header className={cn(className)} {...properties}>
			<nav className="flex items-center border-b py-2">
				<div className="mx-8 flex flex-1 justify-around sm:mx-24 md:mx-32 lg:mx-40">
					<NavigationMenu className="hidden max-w-none justify-start sm:flex">
						<NavigationMenuList>
							<NavigationMenuItem className="flex flex-1 flex-row items-center space-x-2">
								<Image src="/favicon.ico" alt="favicon" width={48} height={48} priority className="rounded-full" />
								<Link href="/" className="text-base">
									Ticketer
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<NavigationMenu className="max-w-none justify-start sm:justify-center">
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger>Documentation</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[300px] gap-3 px-2 py-4 md:w-[400px]">
										<ListItem href="/docs/commands" icon={<Terminal />} title="Commands">
											View some of the most popular and important commands in Ticketer.
										</ListItem>
										<ListItem href="/docs/self-hosting" icon={<Server />} title="Self-Hosting">
											Learn how to self-host the Ticketer bot on any computer that supports Docker.
										</ListItem>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger>Legal</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[300px] gap-3 px-2 py-4 md:w-[400px]">
										<ListItem href="/legal/privacy-policy" icon={<Cookie />} title="Privacy Policy">
											Read the privacy policy for Ticketer.
										</ListItem>
										<ListItem href="/legal/terms-of-service" icon={<Scale />} title="Terms of Service">
											Read the terms of service for Ticketer.
										</ListItem>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<div className="flex flex-1 items-center justify-end">
						<div className="block md:hidden">
							<Sheet>
								<SheetTrigger>
									<Button variant="outline" size="icon" asChild aria-label="Open Drawer">
										<Menu />
									</Button>
								</SheetTrigger>
								<SheetContent side="right">
									<SheetHeader className="pb-2">
										<SheetTitle>Links & Theme</SheetTitle>
									</SheetHeader>
									<div className="space-y-4">
										{tooltipLinkItems.map((item, index) => (
											<div key={index} className="flex items-center space-x-2">
												<TooltipLinkItem icon={item.icon} href={item.href}>
													{item.content}
												</TooltipLinkItem>
												<p>{item.content}</p>
											</div>
										))}
										<div className="flex items-center space-x-2">
											<ThemeSwitcher />
											<p>Change Theme</p>
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
						<div className="hidden space-x-2 md:flex">
							{tooltipLinkItems.map((item, index) => (
								<TooltipLinkItem key={index} icon={item.icon} href={item.href}>
									{item.content}
								</TooltipLinkItem>
							))}
							<ThemeSwitcher />
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
