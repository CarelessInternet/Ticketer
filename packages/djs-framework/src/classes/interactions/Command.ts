import {
	ApplicationCommandType,
	type ChatInputCommandInteraction,
	type CommandInteraction,
	ContextMenuCommandBuilder,
	InteractionContextType,
	InteractionType,
	type MessageContextMenuCommandInteraction,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder,
	type SlashCommandSubcommandsOnlyBuilder,
	type UserContextMenuCommandInteraction,
} from 'discord.js';
import { BaseInteraction } from '.';

/**
 * The interaction for application commands. This is the main endpoint for interactions.
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/CommandInteraction}
 */
export abstract class Interaction extends BaseInteraction.Interaction {
	public readonly guildOnly: boolean = false;
	public readonly ownerOnly: boolean = false;

	public readonly commandType: ApplicationCommandType = ApplicationCommandType.ChatInput;
	public readonly type = InteractionType.ApplicationCommand;

	public abstract readonly data: Data;

	protected get SlashBuilder() {
		return new SlashCommandBuilder().setContexts(InteractionContextType.Guild);
	}

	protected get ContextUserBuilder() {
		Reflect.set(this, 'commandType', ApplicationCommandType.User);

		return new ContextMenuCommandBuilder()
			.setContexts(InteractionContextType.Guild)
			.setType(ApplicationCommandType.User);
	}

	protected get ContextMessageBuilder() {
		Reflect.set(this, 'commandType', ApplicationCommandType.Message);

		return new ContextMenuCommandBuilder()
			.setContexts(InteractionContextType.Guild)
			.setType(ApplicationCommandType.Message);
	}

	public abstract execute?(parameters: Context<Types>): unknown;
}

export type Data =
	| SlashCommandBuilder
	| SlashCommandOptionsOnlyBuilder
	| SlashCommandSubcommandsOnlyBuilder
	| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
	| ContextMenuCommandBuilder;

export type Types = 'chat' | 'message' | 'user' | undefined;

export interface Context<T extends Types = undefined> {
	interaction: T extends 'chat'
		? ChatInputCommandInteraction<'cached'>
		: T extends 'message'
			? MessageContextMenuCommandInteraction<'cached'>
			: T extends 'user'
				? UserContextMenuCommandInteraction<'cached'>
				: CommandInteraction<'cached'>;
}

export type Constructable = new (...arguments_: ConstructorParameters<typeof Interaction>) => Interaction;
