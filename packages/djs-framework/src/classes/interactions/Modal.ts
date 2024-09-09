import { InteractionType, type ModalSubmitInteraction } from 'discord.js';
import { BaseInteraction } from '.';

/**
 * The interaction for modals.
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ModalSubmitInteraction}
 */
export abstract class Interaction extends BaseInteraction.Interaction {
	public readonly type = InteractionType.ModalSubmit;

	public abstract readonly customIds: CustomIds;

	public abstract execute(parameters: Context): unknown;
}

export interface Context {
	interaction: ModalSubmitInteraction<'cached'>;
}

export type CustomIds = BaseInteraction.CustomIds;
export type Constructable = new (...arguments_: ConstructorParameters<typeof Interaction>) => Interaction;
