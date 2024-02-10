export const parseInteger = (number: unknown) => {
	const parsed = Number.parseInt(String(number));

	return Number.isNaN(parsed) ? undefined : parsed;
};
