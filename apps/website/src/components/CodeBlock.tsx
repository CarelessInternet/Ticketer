'use client';

import type { HTMLAttributes, PropsWithChildren } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
	const t = useTranslations('components.codeblock');

	const saveToClipboard = (text: string) =>
		navigator.clipboard
			.writeText(text)
			.then(() => toast(t('copied')))
			.catch((error: unknown) => {
				console.error(error);
			});

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
						<span className={`flex ${slashCommand ? '' : 'gap-2'}`}>
							{!fileName && (
								<span className={slashCommand ? 'text-yellow-300' : 'text-gray-500'}>{slashCommand ? '/' : '$'}</span>
							)}
							{children}
						</span>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger
								onKeyUp={(event) => {
									if (event.key === 'Enter') {
										void saveToClipboard(clipboardText);
									}
								}}
							>
								<Copy
									className="hover:scale-110"
									onClick={() => {
										void saveToClipboard(clipboardText);
									}}
								/>
							</TooltipTrigger>
							<TooltipContent>
								<p>{t('copy')}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</code>
		</div>
	);
}
