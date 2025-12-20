import type { formats } from '@/i18n/request';
import type { Locale } from '@/i18n/routing';
import type enGB from './src/i18n/languages/en-GB.json';

declare module 'next-intl' {
	interface AppConfig {
		Locale: Locale;
		Messages: typeof enGB;
		Formats: typeof formats;
	}
}
