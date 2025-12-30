import { InteractionType } from 'discord.js';
import {
	type Autocomplete,
	BaseInteraction,
	type Command,
	type Component,
	Event,
	type InteractionClassTypes,
	type Modal,
	type Subcommand,
} from '..';

/**
 * @returns Whether the class instance is an event class.
 */
export function isEvent(event: unknown): event is Event.Handler {
	return event instanceof Event.Handler;
}

/**
 * @returns Whether the class instance is an interaction class.
 */
export function isInteraction(interaction: unknown): interaction is BaseInteraction.Interaction {
	return interaction instanceof BaseInteraction.Interaction;
}

/**
 * @returns Whether the interaction is from an application command.
 */
export function isCommand(
	interaction: InteractionClassTypes | BaseInteraction.Interaction,
): interaction is Command.Interaction {
	return interaction.type === InteractionType.ApplicationCommand;
}

/**
 * @returns Whether the interaction is from a subcommand of an application command.
 */
export function isSubcommand(
	interaction: InteractionClassTypes | BaseInteraction.Interaction,
): interaction is Subcommand.Interaction {
	return 'data' in interaction && 'subcommandNames' in interaction.data;
}

/**
 * @returns Whether the interaction is from a component.
 */
export function isComponent(
	interaction: InteractionClassTypes | BaseInteraction.Interaction,
): interaction is Component.Interaction {
	return interaction.type === InteractionType.MessageComponent;
}

/**
 * @returns Whether the interaction is from autocomplete.
 */
export function isAutocomplete(
	interaction: InteractionClassTypes | BaseInteraction.Interaction,
): interaction is Autocomplete.Interaction {
	return interaction.type === InteractionType.ApplicationCommandAutocomplete;
}

/**
 * @returns Whether the interaction is from a modal.
 */
export function isModal(
	interaction: InteractionClassTypes | BaseInteraction.Interaction,
): interaction is Modal.Interaction {
	return interaction.type === InteractionType.ModalSubmit;
}
