import deepmerge from 'deepmerge';
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

	// Use the same translation file for the American English version as the British.
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const localeMessages = await import(`./languages/${locale === 'en-US' ? 'en-GB' : locale}.json`);
	// https://next-intl-docs.vercel.app/docs/usage/configuration#messages-fallback
	const defaultMessages = await import('./languages/en-GB.json');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
	const messages = deepmerge(defaultMessages.default, localeMessages.default);

	return { locale, messages };
});
