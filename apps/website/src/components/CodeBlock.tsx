'use client';

import type { HTMLAttributes, PropsWithChildren } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';

interface CodeBlockProperties extends HTMLAttributes<HTMLElement> {
	clipboardText: string;
	fileName?: string;
	slashCommand?: boolean;
}

// Design from https://tailwindflex.com/@sienna/copy-code-block
export default function CodeBlock({
	children,
	className,
	clipboardText,
	fileName,
	slashCommand,
	...properties
}: PropsWithChildren<CodeBlockProperties>) {
	const { toast } = useToast();

	return (
		<div className="pb-2">
			<code
				className={cn(
					'inline-flex max-w-full truncate rounded-lg bg-gray-800 p-4 text-left text-sm text-white sm:text-base',
					className,
				)}
				{...properties}
			>
				<div className="flex flex-row space-x-6 truncate">
					<div className="flex flex-col space-y-2 truncate">
						{fileName && <span className="text-slate-300 underline underline-offset-2">{fileName}</span>}
						<span className={`flex ${!slashCommand && 'gap-2'}`}>
							{!fileName && <span className={`${!slashCommand && 'text-gray-500'}`}>{slashCommand ? '/' : '$'}</span>}
							{children}
						</span>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Copy
									className="hover:scale-110"
									onClick={() => {
										void navigator.clipboard.writeText(clipboardText);
										toast({ title: 'Copied to Clipboard!' });
									}}
								/>
							</TooltipTrigger>
							<TooltipContent>
								<p>Copy</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</code>
		</div>
	);
}
