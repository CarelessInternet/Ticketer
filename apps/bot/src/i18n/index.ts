import type { Locales, TranslationFunctions } from './i18n-types';
import L from './i18n-node';
import type { Locale } from 'discord.js';
import { locales } from './i18n-util';

// https://stackoverflow.com/a/58436959
type Leaves<T> = T extends object
	? { [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}` }[keyof T]
	: never;

export const getTranslations = <T extends Leaves<TranslationFunctions>>(key: T) => {
	const translations = {};

	for (const language of locales) {
		let nestedTranslation = L[language];

		for (const nestedKey of key.split('.')) {
			// @ts-expect-error: Complaining about the any type.
			nestedTranslation = nestedTranslation[nestedKey];
		}

		// @ts-expect-error: Complaining about the any type.
		translations[language] = nestedTranslation();
	}

	return translations as Record<Locales, string>;
};

export const translate = <T extends Locale | Locales>(language: T) =>
	locales.includes(language as Locales) ? L[language as Locales] : L['en-GB'];

export type { Locales } from './i18n-types';
