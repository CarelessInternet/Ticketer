import type { ClientEvents } from 'discord.js';
import { Base } from './index';

/**
 * The class used for each event.
 */
export abstract class Handler extends Base {
	public readonly once: boolean = false;
	// Would use the Events enum, but the <Client>.on event only takes in "keyof ClientEvents".
	public abstract readonly name: keyof ClientEvents;
}

export { Events as Name } from 'discord.js';

export type ArgumentsOf<T extends keyof ClientEvents> = ClientEvents[T];
export type Constructable = new (...arguments_: ConstructorParameters<typeof Handler>) => Handler;
