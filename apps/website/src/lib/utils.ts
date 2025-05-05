// eslint-disable-next-line unicorn/prevent-abbreviations
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatDate = (date: Date) =>
	new Intl.DateTimeFormat('en-CA', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date);

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
