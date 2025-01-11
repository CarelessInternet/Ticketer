import { type BaseInteraction, type PermissionFlagsValues, getPermissionByValue } from '..';
import { MessageFlags, inlineCode } from 'discord.js';

export function RequiredGlobalPermissions(...permissions: PermissionFlagsValues[]) {
	return function (_: object, __: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value as () => void;

		descriptor.value = async function (this: BaseInteraction.Interaction, { interaction }: BaseInteraction.Context) {
			if (!interaction.isRepliable()) return;

			const me = await interaction.guild.members.fetchMe();

			if (!me.permissions.has(permissions)) {
				const allPermissions = permissions.map((permission) => getPermissionByValue(permission));
				// Changes the PascalCase strings to Split Pascal Case for better user readability.
				const permissionsAsString = allPermissions
					.filter(Boolean)
					.map((permission) => permission?.match(/[A-Z][a-z]+/g)?.join(' '))
					.join(', ');

				const embed = this.userEmbedError(interaction.member).setDescription(
					`I need the following global permissions to run this command: ${inlineCode(permissionsAsString)}`,
				);

				return interaction.deferred
					? interaction.editReply({ embeds: [embed] })
					: interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
			}

			return Reflect.apply(original, this, arguments);
		};

		return descriptor;
	};
}
