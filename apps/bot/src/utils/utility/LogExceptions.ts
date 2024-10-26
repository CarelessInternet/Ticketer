import chalk from 'chalk';

export function LogExceptions(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = async function () {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-rest-params
			return await Reflect.apply(original, this, arguments);
		} catch (error) {
			console.error(chalk.bgRed('[ERROR]'), error);
		}
	};

	return descriptor;
}
