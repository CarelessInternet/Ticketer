import type { Autocomplete, BaseInteraction, Command, Component, Event, Modal } from '.';
import { Collection, Client as DiscordClient, Routes, type Snowflake } from 'discord.js';
import { Guards, glob } from '../index';

/**
 * The extended version of the discord.js Client.
 * @description Call the `init` method after constructing this class.
 */
export class Client extends DiscordClient {
	public readonly events = new Collection<string, Event.Handler>();

	public readonly commands = new Collection<string, Command.Interaction>();
	public readonly components = new Collection<string, Component.Interaction>();
	public readonly autocompletes = new Collection<string, Autocomplete.Interaction>();
	public readonly modals = new Collection<string, Modal.Interaction>();

	/**
	 * Initializes events and commands.
	 */
	public async init(eventsFolder: string, commandsFolder: string) {
		// Event handler: sets all events.
		const events = await this.fetchEvents(eventsFolder);

		for (const event of events) {
			this.events.set(event.name, event);

			if (event.once) {
				super.once(event.name, (...eventArguments) => event.execute(eventArguments));
			} else {
				super.on(event.name, (...eventArguments) => event.execute(eventArguments));
			}
		}

		// Interaction handler: sets all interactions accordingly to their type.
		const interactions = await this.fetchInteractions(commandsFolder);

		for (const interaction of interactions) {
			if (Guards.isCommand(interaction)) {
				this.commands.set(interaction.data.name, interaction);
			}

			if (Guards.isComponent(interaction)) {
				for (const id of interaction.customIds) {
					this.components.set(id, interaction);
				}
			}

			if (Guards.isAutocomplete(interaction)) {
				this.autocompletes.set(interaction.name, interaction);
			}

			if (Guards.isModal(interaction)) {
				for (const id of interaction.customIds) {
					this.modals.set(id, interaction);
				}
			}
		}
	}

	/**
	 * @returns All events that are defined in the command files.
	 */
	private async fetchEvents(path: string) {
		const files = await glob(path);
		const events: Event.Handler[] = [];

		for await (const file of files) {
			const { default: Event }: { default?: Event.Constructable } = await import(file);

			if (Event) {
				events.push(new Event(this));
			}
		}

		return events;
	}

	/**
	 * @returns All interactions that are defined in the command files.
	 */
	private async fetchInteractions(path: string) {
		const files = await glob(path);
		const commands: BaseInteraction.Interaction[] = [];

		for await (const file of files) {
			const interactions: Interactions = await import(file);
			const values = Object.values(interactions) as ValueOf<Interactions>[];

			for (const Interaction of values) {
				if (Interaction) {
					commands.push(new Interaction(this));
				}
			}
		}

		return commands;
	}

	/**
	 * Deploys all application commands.
	 */
	public async deploy({ token: Token, applicationId, guildId }: ClientDeployOptions) {
		const token = Token ?? this.token;

		if (!token) {
			throw new TypeError('Missing a Client token.');
		}

		this.rest.setToken(token);

		const global = this.commands.filter((cmd) => !cmd.guildOnly).map((cmd) => cmd.data.toJSON());
		const guild = this.commands.filter((cmd) => cmd.guildOnly).map((cmd) => cmd.data.toJSON());

		if (global.length > 0) {
			await this.rest.put(Routes.applicationCommands(applicationId), {
				body: global,
			});
		}

		if (guild.length > 0 && guildId) {
			await this.rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
				body: guild,
			});
		}
	}
}

export interface ClientDeployOptions {
	applicationId: Snowflake;
	/**
	 * Required if there are guild only commands.
	 */
	guildId?: Snowflake;
	/**
	 * Required if the token hasn't already been set in the client.
	 */
	token?: Snowflake;
}

interface Interactions {
	default?: Command.Constructable;
	ComponentInteraction?: Component.Constructable;
	AutocompleteInteraction?: Autocomplete.Constructable;
	ModalInteraction?: Modal.Constructable;
}

type ValueOf<T> = T[keyof T];
