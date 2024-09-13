import { type AutocompleteInteraction, InteractionType } from 'discord.js';
import { BaseInteraction } from '.';

/**
 * The interaction for autocomplete.
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/AutocompleteInteraction}
 */
export abstract class Interaction extends BaseInteraction.Interaction {
	public readonly type = InteractionType.ApplicationCommandAutocomplete;

	public abstract readonly name: string;

	public abstract execute(parameters: Context): unknown;
}

export interface Context {
	interaction: AutocompleteInteraction<'cached'>;
}

export type Constructable = new (...arguments_: ConstructorParameters<typeof Interaction>) => Interaction;
