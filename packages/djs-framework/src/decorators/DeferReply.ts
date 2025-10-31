import type { Command } from '..';
import { MessageFlags } from 'discord.js';

interface DeferReplyOptions {
	name?: string;
	ephemeral?: boolean;
}

/**
 * @param [options] Options for deferring the reply.
 * @param [options.name] The name of the command option if one is specified.
 * @param [options.ephemeral=false] The default value of the ephemeral option if no command option can be found.
 */
export function DeferReply({ name, ephemeral = false }: DeferReplyOptions = {}) {
	return function (_: object, __: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value as () => void;

		descriptor.value = async function (this: Command.Interaction, { interaction }: Command.Context) {
			if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
				const hidden = interaction.isChatInputCommand()
					? (interaction.options.getBoolean(String(name), false) ?? ephemeral)
					: ephemeral;

				await interaction.deferReply({ ...(hidden && { flags: [MessageFlags.Ephemeral] }) });
			}

			return Reflect.apply(original, this, arguments);
		};

		return descriptor;
	};
}
