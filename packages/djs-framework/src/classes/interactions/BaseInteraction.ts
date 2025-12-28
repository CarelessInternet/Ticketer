import type { BaseInteraction, InteractionType } from 'discord.js';
import { Base } from '..';

/**
 * Provides the base layer for all interactions. Interactions are separated based on the interaction type.
 * @description Make sure the interactions are in cached guilds (@see {@link BaseInteraction.inCachedGuild}).
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/BaseInteraction}
 * @see {@link https://discord-api-types.dev/api/discord-api-types-v10/enum/InteractionType}
 */
export abstract class Interaction extends Base {
	public abstract readonly type: InteractionType;

	public abstract execute?(parameters: Context): unknown;
}

export interface Context {
	/**
	 * @description Interactions should always be in cached guilds as per a user-created check in the 'interactionCreate' event.
	 */
	interaction: BaseInteraction<'cached'>;
}

export type CustomIds = string[];
export type Constructable = new (...arguments_: ConstructorParameters<typeof Interaction>) => Interaction;
