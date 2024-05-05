import type { Autocomplete, BaseInteraction, Command, Component, Modal } from '../';
import { InteractionType } from 'discord.js';

/**
 * @returns Whether the interaction is from an application command.
 */
export function isCommand(interaction: BaseInteraction.Interaction): interaction is Command.Interaction {
	return interaction.type === InteractionType.ApplicationCommand;
}

/**
 * @returns Whether the interaction is from a component.
 */
export function isComponent(interaction: BaseInteraction.Interaction): interaction is Component.Interaction {
	return interaction.type === InteractionType.MessageComponent;
}

/**
 * @returns Whether the interaction is from autocomplete.
 */
export function isAutocomplete(interaction: BaseInteraction.Interaction): interaction is Autocomplete.Interaction {
	return interaction.type === InteractionType.ApplicationCommandAutocomplete;
}

/**
 * @returns Whether the interaction is from a modal.
 */
export function isModal(interaction: BaseInteraction.Interaction): interaction is Modal.Interaction {
	return interaction.type === InteractionType.ModalSubmit;
}
