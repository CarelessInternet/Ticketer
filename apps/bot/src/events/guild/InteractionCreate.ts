import { Event } from '@ticketer/djs-framework';
import { LogExceptions } from '@/utils';
import { environment } from '@ticketer/env/bot';
import { translate } from '@/i18n';

export default class extends Event.Handler {
	public readonly name = Event.Name.InteractionCreate;

	@LogExceptions
	public execute([interaction]: Event.ArgumentsOf<this['name']>) {
		if (!interaction.inCachedGuild()) return;

		if (interaction.isCommand()) {
			const command = this.client.commands.get(interaction.commandName);

			if (!command) return;
			if (command.ownerOnly && interaction.user.id !== environment.DISCORD_OWNER_ID) {
				return interaction.reply({
					content: translate(interaction.locale).events.interactionCreate.ownerOnly.error(),
					ephemeral: true,
				});
			}

			return command.execute({ interaction });
		}

		if (interaction.isMessageComponent()) {
			const { customId } = super.extractCustomId(interaction.customId);
			return this.client.components.get(customId)?.execute({ interaction });
		}

		if (interaction.isAutocomplete()) {
			return this.client.autocompletes.get(interaction.commandName)?.execute({ interaction });
		}

		if (interaction.isModalSubmit()) {
			const { customId } = super.extractCustomId(interaction.customId);
			return this.client.modals.get(customId)?.execute({ interaction });
		}
	}
}
