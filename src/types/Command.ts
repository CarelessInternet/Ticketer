import type {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import type { Client } from '.';

export interface Command {
	readonly execute: ({
		client,
		interaction
	}: {
		client: Client;
		interaction: CommandInteraction;
	}) => Promise<void> | void;
	readonly data:
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder;
	readonly category: 'Utility' | 'Ticketing' | 'Staff' | 'Suggestions';
	readonly ownerOnly?: boolean;
	readonly privateGuildAndOwnerOnly?: boolean;
}
