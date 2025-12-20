import deepmerge from 'deepmerge';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

	// Use the same translation file for the American English version as the British.
	const localeMessages = await import(`./languages/${locale === 'en-US' ? 'en-GB' : locale}.json`);
	// https://next-intl-docs.vercel.app/docs/usage/configuration#messages-fallback
	const defaultMessages = await import('./languages/en-GB.json');
	const messages = deepmerge(defaultMessages.default, localeMessages.default);

	return { locale, messages };
});
