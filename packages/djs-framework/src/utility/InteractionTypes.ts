import type { Autocomplete, Command, Component, Modal, Subcommand } from '..';

export type InteractionConstructableTypes =
	| Autocomplete.Constructable
	| Command.Constructable
	| Component.Constructable
	| Modal.Constructable
	| Subcommand.Constructable;

export type InteractionClassTypes =
	| Autocomplete.Interaction
	| Command.Interaction
	| Component.Interaction
	| Modal.Interaction
	| Subcommand.Interaction;
