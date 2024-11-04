import { type Locale, routing } from './routing';
import deepmerge from 'deepmerge';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
	let locale = await requestLocale;

	if (!locale || !routing.locales.includes(locale as Locale)) {
		locale = routing.defaultLocale;
	}

	// Use the same translation file for the American English version as the British.
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const localeMessages = await import(`./languages/${(locale as Locale) === 'en-US' ? 'en-GB' : locale}.json`);
	// https://next-intl-docs.vercel.app/docs/usage/configuration#messages-fallback
	const defaultMessages = await import('./languages/en-GB.json');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
	const messages = deepmerge(defaultMessages.default, localeMessages.default);

	return {
		locale,
		messages,
	};
});
