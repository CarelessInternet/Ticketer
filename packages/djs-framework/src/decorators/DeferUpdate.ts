import type { BaseInteraction } from '..';

export function DeferUpdate(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = async function (this: BaseInteraction.Interaction, { interaction }: BaseInteraction.Context) {
		// The deferUpdate() method exists on the interactions below.
		if (
			(interaction.isMessageComponent() || interaction.isModalSubmit()) &&
			!interaction.replied &&
			!interaction.deferred
		) {
			await interaction.deferUpdate();
		}

		// biome-ignore lint/complexity/noArguments: It is convenient.
		return Reflect.apply(original, this, arguments);
	};

	return descriptor;
}
