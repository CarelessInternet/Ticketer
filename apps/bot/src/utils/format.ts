export const formatDate = (date: Date) =>
	Intl.DateTimeFormat(undefined, {
		dateStyle: 'long',
		timeStyle: 'long',
		timeZone: 'Europe/Stockholm',
	}).format(date);
