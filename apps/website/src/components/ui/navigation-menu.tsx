import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

function NavigationMenu({
	className,
	children,
	viewport = true,
	...properties
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
	return (
		<NavigationMenuPrimitive.Root
			data-slot="navigation-menu"
			data-viewport={viewport}
			className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)}
			{...properties}
		>
			{children}
			{viewport && <NavigationMenuViewport />}
		</NavigationMenuPrimitive.Root>
	);
}
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

function NavigationMenuList({ className, ...properties }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
	return (
		<NavigationMenuPrimitive.List
			data-slot="navigation-menu-list"
			className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)}
			{...properties}
		/>
	);
}
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

function NavigationMenuItem({ className, ...properties }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
	return (
		<NavigationMenuPrimitive.Item
			data-slot="navigation-menu-item"
			className={cn('relative', className)}
			{...properties}
		/>
	);
}
NavigationMenuItem.displayName = NavigationMenuPrimitive.Item.displayName;

const navigationMenuTriggerStyle = cva(
	'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent dark:hover:text-cyan-400 focus:bg-accent dark:focus:text-cyan-400 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
);

function NavigationMenuTrigger({
	className,
	children,
	...properties
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
	return (
		<NavigationMenuPrimitive.Trigger
			data-slot="navigation-menu-trigger"
			className={cn(navigationMenuTriggerStyle(), 'group', className)}
			{...properties}
		>
			{children}{' '}
			<ChevronDown
				className="relative top-px ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
				aria-hidden="true"
			/>
		</NavigationMenuPrimitive.Trigger>
	);
}
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

function NavigationMenuContent({
	className,
	...properties
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
	return (
		<NavigationMenuPrimitive.Content
			data-slot="navigation-menu-content"
			className={cn(
				'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full md:absolute md:w-auto',
				className,
			)}
			{...properties}
		/>
	);
}
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

function NavigationMenuLink({ className, ...properties }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
	return (
		<NavigationMenuPrimitive.Link
			data-slot="navigation-menu-link"
			className={cn(
				"data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...properties}
		/>
	);
}
NavigationMenuLink.displayName = NavigationMenuPrimitive.Link.displayName;

function NavigationMenuViewport({
	className,
	...properties
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
	return (
		<div className={cn('absolute top-full left-0 flex justify-center')}>
			<NavigationMenuPrimitive.Viewport
				data-slot="navigation-menu-viewport"
				className={cn(
					'origin-top-center bg-background text-background-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-md border shadow-lg md:w-(--radix-navigation-menu-viewport-width)',
					className,
				)}
				{...properties}
			/>
		</div>
	);
}
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

function NavigationMenuIndicator({
	className,
	...properties
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
	return (
		<NavigationMenuPrimitive.Indicator
			data-slot="navigation-menu-indicator"
			className={cn(
				'data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-1 flex h-1.5 items-end justify-center overflow-hidden',
				className,
			)}
			{...properties}
		>
			<div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
		</NavigationMenuPrimitive.Indicator>
	);
}
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
	navigationMenuTriggerStyle,
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
};
