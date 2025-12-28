import { glob } from 'node:fs/promises';
import { Collection, Client as DiscordClient, Routes, type Snowflake } from 'discord.js';
import {
	type Autocomplete,
	type BaseInteraction,
	type Command,
	type Component,
	type Event,
	Guards,
	type InteractionConstructableTypes,
	type Modal,
	type Subcommand,
} from '..';

/**
 * The extended version of the discord.js Client.
 * @description Call the `init` method after constructing this class.
 */
export class Client extends DiscordClient {
	public readonly events = new Collection<string, Event.Handler>();

	public readonly autocompletes = new Collection<string, Autocomplete.Interaction>();
	public readonly commands = new Collection<string, Command.Interaction>();
	public readonly components = new Collection<string, Component.Interaction>();
	public readonly modals = new Collection<string, Modal.Interaction>();
	public readonly subcommands = new Collection<Subcommand.Data, Subcommand.Interaction>();

	public guildBlacklists = new Collection<Snowflake, GuildBlacklist>();

	/**
	 * Initializes events and commands.
	 */
	public async initialize(eventsFolder: string, commandsFolder: string) {
		// Event handler: sets all events.
		const events = await this.fetchEvents(eventsFolder);

		for (const event of events) {
			this.events.set(event.name, event);

			if (event.once) {
				super.once(event.name, (...eventArguments) => event.execute?.(eventArguments));
			} else {
				super.on(event.name, (...eventArguments) => event.execute?.(eventArguments));
			}
		}

		// Interaction handler: sets all interactions accordingly to their type.
		const interactions = await this.fetchInteractions(commandsFolder);

		for (const interaction of interactions) {
			if (Guards.isAutocomplete(interaction)) {
				this.autocompletes.set(interaction.name, interaction);
			}

			if (Guards.isCommand(interaction) && !Guards.isSubcommand(interaction)) {
				this.commands.set(interaction.data.name, interaction);
			}

			if (Guards.isComponent(interaction)) {
				for (const id of interaction.customIds) {
					this.components.set(id, interaction);
				}
			}

			if (Guards.isModal(interaction)) {
				for (const id of interaction.customIds) {
					this.modals.set(id, interaction);
				}
			}

			if (Guards.isSubcommand(interaction)) {
				this.subcommands.set(interaction.data, interaction);
			}
		}
	}

	/**
	 * @returns All events that are defined in the command files.
	 */
	private async fetchEvents(path: string) {
		const events: Event.Handler[] = [];

		for await (const file of glob(`${path}/**/*.ts`)) {
			const { default: ImportedEvent }: { default?: Event.Constructable } = await import(file);
			const eventAsClass = ImportedEvent ? new ImportedEvent(this) : undefined;

			if (Guards.isEvent(eventAsClass)) {
				events.push(eventAsClass);
			}
		}

		return events;
	}

	/**
	 * @returns All interactions that are defined in the command files.
	 */
	private async fetchInteractions(path: string) {
		const commands: BaseInteraction.Interaction[] = [];
		// https://stackoverflow.com/a/30760236
		const isClass = (object: unknown) => typeof object === 'function' && /^\s*class\s+/.test(object.toString());

		for await (const file of glob(`${path}/**/*.ts`)) {
			const interactions: Interactions = await import(file);
			const values = Object.values(interactions) as ValueOf<Interactions>[];

			for (const Interaction of values) {
				if (!isClass(Interaction)) continue;

				const interactionAsClass = new Interaction(this);

				if (Guards.isInteraction(interactionAsClass)) {
					commands.push(interactionAsClass);
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

interface GuildBlacklist {
	guildId?: Snowflake;
	reason: string;
	timestamp: Date;
}

export interface ClientDeployOptions {
	applicationId: Snowflake;
	/**
	 * Required if there are guild only commands.
	 */
	guildId?: Snowflake;
	/**
	 * Required if the token has not already been set in the client.
	 */
	token?: Snowflake;
}

type Interactions = Record<string, InteractionConstructableTypes>;

type ValueOf<T> = T[keyof T];
