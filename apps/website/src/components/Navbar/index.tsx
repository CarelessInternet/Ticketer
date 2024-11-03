import type { HTMLAttributes, JSX, PropsWithChildren } from 'react';
import { Menu, MessageCircleQuestion, PlusCircle } from 'lucide-react';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Button } from '@/components/ui/button';
import ExternalLink from '../ExternalLink';
import { SiGithub as GitHub } from '@icons-pack/react-simple-icons';
import Image from 'next/image';
import InternalLink from '../InternalLink';
import Link from './Link';
import LocaleSwitcher from './LocaleSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { cn } from '@/lib/utils';
import { internalRoutes } from '@/lib/routes';

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

interface TooltipItems {
	content: string;
}

function TooltipItem({ content, children }: PropsWithChildren<TooltipItems>) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className="dark:hover:text-cyan-400 dark:focus:text-cyan-400" asChild>
					{children}
				</TooltipTrigger>
				<TooltipContent>
					<p>{content}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

interface TooltipLinkItems extends TooltipItems {
	external?: boolean;
	href: string;
	icon: JSX.Element;
}

function TooltipLinkItem({ content, external, href, icon }: PropsWithChildren<TooltipLinkItems>) {
	return (
		<TooltipItem content={content}>
			<Button variant="outline" size="icon" asChild>
				{external ? (
					<ExternalLink href={href} noDefaultStyles>
						{icon}
					</ExternalLink>
				) : (
					<InternalLink href={href} noLocalisation noDefaultStyles>
						{icon}
					</InternalLink>
				)}
			</Button>
		</TooltipItem>
	);
}

const tooltipLinkItems = [
	{
		content: 'Invite to Discord Server',
		href: '/links/discord/invite',
		icon: <PlusCircle />,
	},
	{
		content: 'Discord Support Server',
		href: '/links/discord/support',
		icon: <MessageCircleQuestion />,
	},
	{
		content: 'GitHub Repository',
		external: true,
		href: 'https://github.com/CarelessInternet/Ticketer',
		icon: <GitHub />,
	},
] satisfies TooltipLinkItems[];

export default function Navbar({ className, ...properties }: HTMLAttributes<HTMLElement>) {
	return (
		<header className={cn(className)} {...properties}>
			<nav className="flex items-center border-b py-2">
				<div className="mx-8 flex flex-1 justify-around sm:mx-20 md:mx-32 lg:mx-40">
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
										{internalRoutes.documentation.map((route) => (
											<ListItem key={route.title} href={route.href} icon={route.icon} title={route.title}>
												{route.description}
											</ListItem>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger>Legal</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[300px] gap-3 px-2 py-4 md:w-[400px]">
										{internalRoutes.legal.map((route, index) => (
											<ListItem key={index} href={route.href} icon={route.icon} title={route.title}>
												{route.description}
											</ListItem>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
					<div className="flex flex-1 items-center justify-end">
						<div className="block lg:hidden">
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
												<TooltipLinkItem
													content={item.content}
													external={item.external}
													href={item.href}
													icon={item.icon}
												/>
												<p>{item.content}</p>
											</div>
										))}
										<div className="flex items-center space-x-2">
											<LocaleSwitcher />
											<p>Change Locale</p>
										</div>
										<div className="flex items-center space-x-2">
											<ThemeSwitcher />
											<p>Change Theme</p>
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
						<div className="hidden space-x-2 lg:flex">
							{tooltipLinkItems.map((item, index) => (
								<TooltipLinkItem
									key={index}
									content={item.content}
									external={item.external}
									href={item.href}
									icon={item.icon}
								/>
							))}
							<TooltipItem content="Change Locale">
								<div>
									<LocaleSwitcher />
								</div>
							</TooltipItem>
							<TooltipItem content="Change Theme">
								<div>
									<ThemeSwitcher />
								</div>
							</TooltipItem>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
