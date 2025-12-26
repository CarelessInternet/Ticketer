import type { Client } from '.';

/**
 * The base for all executable classes.
 */
export abstract class Base {
	public constructor(protected readonly client: Client) {}

	// The return type is `any` because the function should be able to return anything or nothing.
	// biome-ignore lint/suspicious/noExplicitAny: Type `unknown` is more suitable but gave errors.
	public abstract execute(...parameters: unknown[]): any;
}
