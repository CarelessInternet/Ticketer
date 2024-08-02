import type { Locales, TranslationFunctions } from './i18n-types';
import L from './i18n-node';
import { Locale } from 'discord.js';
import { locales } from './i18n-util';

// https://stackoverflow.com/a/58436959
type Leaves<T> = T extends object
	? { [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}` }[keyof T]
	: never;

export const getTranslations = (key: Leaves<TranslationFunctions>) => {
	const translations = {};

	for (const language of locales) {
		let nestedTranslation = L[language];

		for (const nestedKey of key.split('.')) {
			// @ts-expect-error: Easier to shut up the type checking than creating correct types.
			nestedTranslation = nestedTranslation[nestedKey as keyof typeof nestedTranslation];
		}

		// @ts-expect-error: Easier to shut up the type checking than creating correct types.
		translations[language] = nestedTranslation() as string;
	}

	return translations as Record<Locales, string>;
};

/**
 * @param language If no language is specified, it defaults to (British) English.
 */
export const translate = (language?: Locale | Locales) =>
	locales.includes(language as Locales) ? L[language as Locales] : L[Locale.EnglishGB];

export type { Locales } from './i18n-types';
