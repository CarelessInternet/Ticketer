export const formatDateLong = (date = new Date()) =>
	Intl.DateTimeFormat(undefined, {
		dateStyle: 'long',
		timeStyle: 'long',
		timeZone: 'Europe/Stockholm',
	}).format(date);

export const formatDateShort = (date = new Date()) =>
	Intl.DateTimeFormat('en-ZA', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date);
