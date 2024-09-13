import {
	type ButtonInteraction,
	type ChannelSelectMenuInteraction,
	InteractionType,
	type MentionableSelectMenuInteraction,
	type MessageComponentInteraction,
	type RoleSelectMenuInteraction,
	type StringSelectMenuInteraction,
	type UserSelectMenuInteraction,
} from 'discord.js';
import { BaseInteraction } from '.';

/**
 * The interaction for message components.
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/MessageComponentInteraction}
 */
export abstract class Interaction extends BaseInteraction.Interaction {
	public readonly type = InteractionType.MessageComponent;

	public abstract readonly customIds: CustomIds;

	public abstract execute(parameters: Context<ComponentTypes>): unknown;
}

export type ComponentTypes = 'button' | 'string' | 'user' | 'role' | 'mentionable' | 'channel' | undefined;

export interface Context<T extends ComponentTypes = undefined> {
	interaction: T extends 'button'
		? ButtonInteraction<'cached'>
		: T extends 'string'
			? StringSelectMenuInteraction<'cached'>
			: T extends 'user'
				? UserSelectMenuInteraction<'cached'>
				: T extends 'role'
					? RoleSelectMenuInteraction<'cached'>
					: T extends 'mentionable'
						? MentionableSelectMenuInteraction<'cached'>
						: T extends 'channel'
							? ChannelSelectMenuInteraction<'cached'>
							: MessageComponentInteraction<'cached'>;
}

export type CustomIds = BaseInteraction.CustomIds;
export type Constructable = new (...arguments_: ConstructorParameters<typeof Interaction>) => Interaction;
