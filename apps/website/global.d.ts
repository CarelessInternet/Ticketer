import enGB from './src/i18n/languages/en-GB.json';

type Messages = typeof enGB;

declare global {
	// Use type safe message keys with `next-intl`
	interface IntlMessages extends Messages {}
}
