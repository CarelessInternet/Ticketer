import type { Client } from '.';

/**
 * The base for all executable classes.
 */
export abstract class Base {
	public constructor(protected readonly client: Client) {}

	public abstract execute?(...parameters: unknown[]): unknown;
}
