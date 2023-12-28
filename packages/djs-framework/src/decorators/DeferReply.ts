import type { BaseInteraction } from '..';

/**
 * @param ephemeral Whether the deferred reply should be ephemeral.
 */
export function DeferReply(ephemeral: boolean) {
	return function (_: object, __: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value as () => void;

		descriptor.value = async function (this: BaseInteraction.Interaction, { interaction }: BaseInteraction.Context) {
			if (interaction.isRepliable() && !interaction.replied) {
				await interaction.deferReply({ ephemeral });
			}

			return Reflect.apply(original, this, arguments);
		};

		return descriptor;
	};
}
