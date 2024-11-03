import { type Locale, routing } from './routing';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
	let locale = await requestLocale;

	if ((locale as Locale) === 'en-US') {
		locale = 'en-GB' as Locale;
	}

	if (!locale || !routing.locales.includes(locale as Locale)) {
		locale = routing.defaultLocale;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const messages = await import(`./languages/${locale}.json`);

	return {
		locale,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		messages: messages.default,
	};
});
