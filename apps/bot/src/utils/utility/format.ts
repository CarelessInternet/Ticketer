export const formatDateLong = (date = new Date()) =>
	Intl.DateTimeFormat(undefined, {
		dateStyle: 'long',
		timeStyle: 'long',
		timeZone: 'Europe/Stockholm',
	}).format(date);

export const formatDateShort = (date = new Date()) =>
	Intl.DateTimeFormat('en-CA', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date);

export const formatDateTimeShort = (date = new Date()) =>
	Intl.DateTimeFormat('en-CA', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		second: '2-digit',
		minute: '2-digit',
		hour: '2-digit',
		hour12: false,
	}).format(date);
