import { ApplicationCommandType, type ChatInputCommandInteraction, InteractionType } from 'discord.js';
import { BaseInteraction } from '.';

/**
 * The interaction for subcommands of application commands.
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/CommandInteraction}
 */
export abstract class Interaction extends BaseInteraction.Interaction {
	public abstract readonly data: Data;

	public readonly commandType = ApplicationCommandType.ChatInput;
	public readonly type = InteractionType.ApplicationCommand;

	public abstract execute(parameters: Context): unknown;
}

interface BaseData {
	subcommandName: string;
	parentCommandName: string;
}

interface ParentSubcommandData extends BaseData {
	parentSubcommandGroupName: string;
}

export type Data = BaseData | ParentSubcommandData;

export interface Context {
	interaction: ChatInputCommandInteraction<'cached'>;
}

export type Constructable = new (...arguments_: ConstructorParameters<typeof Interaction>) => Interaction;
