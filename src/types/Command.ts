import {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Client } from './index';

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
