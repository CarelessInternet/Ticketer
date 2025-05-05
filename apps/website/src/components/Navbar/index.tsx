import {
	Code,
	Cookie,
	Globe,
	HandCoins,
	Menu,
	MessageCircleQuestion,
	PlusCircle,
	Scale,
	Server,
	Sheet,
	Terminal,
} from 'lucide-react';
import type { HTMLAttributes, JSX, PropsWithChildren } from 'react';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
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
import { getTranslations } from 'next-intl/server';

function ListItem({
	children,
	href,
	icon,
	title,
}: PropsWithChildren<{ href: string; icon: JSX.Element; title: string }>) {
	return (
		<li>
			<Link href={href} className="size-full justify-start p-2" asChild>
				<div className="flex flex-row">
					<div className="flex items-center pr-3">{icon}</div>
					<div className="block space-y-1">
						<h1 className="text-lg font-medium leading-none">{title}</h1>
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

interface Route {
	description: string;
	href: string;
	icon: JSX.Element;
	title: string;
}

interface RouteMenu {
	documentation: Route[];
	legal: Route[];
}

export default async function Navbar({ className, ...properties }: HTMLAttributes<HTMLElement>) {
	const t = await getTranslations('layout.navbar');

	const routes = {
		documentation: [
			{
				description: t('navigation.documentation.routes.commands.description'),
				href: '/docs/commands',
				icon: <Terminal />,
				title: t('navigation.documentation.routes.commands.title'),
			},
			{
				description: t('navigation.documentation.routes.self-hosting.description'),
				href: '/docs/self-hosting',
				icon: <Server />,
				title: t('navigation.documentation.routes.self-hosting.title'),
			},
			{
				description: t('navigation.documentation.routes.development.description'),
				href: '/docs/development',
				icon: <Code />,
				title: t('navigation.documentation.routes.development.title'),
			},
			{
				description: t('navigation.documentation.routes.contributing-to-localisation.description'),
				href: '/docs/contributing-to-localisation',
				icon: <Globe />,
				title: t('navigation.documentation.routes.contributing-to-localisation.title'),
			},
		],
		legal: [
			{
				description: t('navigation.legal.routes.privacy-policy.description'),
				href: '/legal/privacy-policy',
				icon: <Cookie />,
				title: t('navigation.legal.routes.privacy-policy.title'),
			},
			{
				description: t('navigation.legal.routes.terms-of-service.description'),
				href: '/legal/terms-of-service',
				icon: <Scale />,
				title: t('navigation.legal.routes.terms-of-service.title'),
			},
		],
	} satisfies RouteMenu;

	function TooltipLinkItems({ inDrawer = false }: { inDrawer?: boolean }) {
		const items = [
			{
				content: t('items.invite'),
				href: '/links/discord/invite',
				icon: <PlusCircle />,
			},
			{
				content: t('items.support'),
				href: '/links/discord/support',
				icon: <MessageCircleQuestion />,
			},
			{
				content: t('items.github'),
				external: true,
				href: 'https://github.com/CarelessInternet/Ticketer',
				icon: <GitHub />,
			},
			{
				content: t('items.donate'),
				href: '/links/funding/donate',
				icon: <HandCoins />,
			},
		] satisfies TooltipLinkItems[];

		if (inDrawer) {
			return items.map((item, index) => (
				<div key={index} className="flex items-center space-x-2">
					<TooltipLinkItem {...item} />
					<p>{item.content}</p>
				</div>
			));
		}

		return items.map((item, index) => <TooltipLinkItem key={index} {...item} />);
	}

	return (
		<header className={cn(className)} {...properties}>
			<nav className="flex items-center border-b py-2">
				<div className="mx-8 flex flex-1 justify-around sm:mx-14 md:mx-28 lg:mx-40">
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
								<NavigationMenuTrigger>{t('navigation.documentation.title')}</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[300px] gap-3 px-2 py-4 md:w-[400px]">
										{routes.documentation.map((route) => (
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
								<NavigationMenuTrigger>{t('navigation.legal.title')}</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[300px] gap-3 px-2 py-4 md:w-[400px]">
										{routes.legal.map((route, index) => (
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
										<SheetTitle>{t('items.sidebar')}</SheetTitle>
									</SheetHeader>
									<div className="space-y-4">
										<TooltipLinkItems inDrawer />
										<div className="flex items-center space-x-2">
											<LocaleSwitcher />
											<p>{t('items.locale.change')}</p>
										</div>
										<div className="flex items-center space-x-2">
											<ThemeSwitcher />
											<p>{t('items.theme.change')}</p>
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
						<div className="hidden space-x-2 lg:flex">
							<TooltipLinkItems />
							<TooltipItem content={t('items.locale.change')}>
								<div>
									<LocaleSwitcher />
								</div>
							</TooltipItem>
							<TooltipItem content={t('items.theme.change')}>
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
