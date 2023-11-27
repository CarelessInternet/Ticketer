import { Event } from '@ticketer/djs-framework';
import { environment } from '@ticketer/env/bot';
import { translate } from '@/i18n';

export default class extends Event.Handler {
	public readonly name = Event.Name.InteractionCreate;

	public execute([interaction]: Event.ArgumentsOf<this['name']>) {
		if (interaction.inCachedGuild()) {
			if (interaction.isCommand()) {
				const command = this.client.commands.get(interaction.commandName);

				if (command) {
					if (command.ownerOnly && interaction.user.id !== environment.DISCORD_OWNER_ID) {
						return interaction.reply({
							content: translate(interaction.locale).events.interactionCreate.ownerOnly.error(),
							ephemeral: true,
						});
					}

					return command.execute({ interaction });
				}
			}

			if (interaction.isMessageComponent()) {
				return this.client.components.get(interaction.customId)?.execute({ interaction });
			}

			if (interaction.isAutocomplete()) {
				return this.client.autocompletes.get(interaction.commandName)?.execute({ interaction });
			}

			if (interaction.isModalSubmit()) {
				return this.client.modals.get(interaction.customId)?.execute({ interaction });
			}
		}
	}
}
