import { type BaseInteraction, type PermissionFlagsValues, getPermissionByValue } from '..';
import { inlineCode } from 'discord.js';

export function RequiredChannelPermissions(...permissions: PermissionFlagsValues[]) {
	return function (_: object, __: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value as () => void;

		descriptor.value = async function (this: BaseInteraction.Interaction, { interaction }: BaseInteraction.Context) {
			if (!interaction.isRepliable() || !interaction.channel) {
				return;
			}

			const me = await interaction.guild.members.fetchMe();

			if (!interaction.channel.permissionsFor(me).has(permissions)) {
				const allPermissions = permissions.map((permission) => getPermissionByValue(permission));
				// Changes the PascalCase strings to Split Pascal Case for better user readability.
				const permissionsAsString = allPermissions
					.filter(Boolean)
					.map((permission) => permission?.match(/[A-Z][a-z]+/g)?.join(' '))
					.join(', ');

				const embed = this.userEmbedError(interaction.user).setDescription(
					`I need the following permissions in this channel to run the specified command: ${inlineCode(
						permissionsAsString,
					)}`,
				);

				return interaction.deferred
					? interaction.editReply({ embeds: [embed] })
					: interaction.reply({ embeds: [embed], ephemeral: true });
			}

			return Reflect.apply(original, this, arguments);
		};

		return descriptor;
	};
}
