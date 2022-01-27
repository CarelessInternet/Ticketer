import type {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';
import type { ButtonInteraction, CommandInteraction } from 'discord.js';
import type { Client } from '.';

type Awaitable<T> = T | PromiseLike<T>;

export interface Command {
	readonly execute: ({
		client,
		interaction
	}: {
		client: Client;
		interaction: CommandInteraction;
	}) => Awaitable<void>;
	readonly buttonExecute?: ({
		client,
		interaction
	}: {
		client: Client;
		interaction: ButtonInteraction;
	}) => Awaitable<void>;
	readonly data:
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder;
	readonly category: 'Utility' | 'Ticketing' | 'Staff' | 'Suggestions';
	readonly ownerOnly?: boolean;
	readonly privateGuildAndOwnerOnly?: boolean;
}
