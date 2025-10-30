import { MessageFlags, TimestampStyles, time } from 'discord.js';
import { Event } from '@ticketer/djs-framework';
import { LogExceptions } from '@/utils';
import { environment } from '@ticketer/env/bot';
import { translate } from '@/i18n';

export default class extends Event.Handler {
	public readonly name = Event.Name.InteractionCreate;

	@LogExceptions
	public execute([interaction]: Event.ArgumentsOf<this['name']>) {
		if (!interaction.inCachedGuild()) return;

		const blacklist = this.client.guildBlacklists.get(interaction.guildId);

		if (blacklist) {
			const translations = translate(interaction.locale).events.interactionCreate.blacklisted;

			return (
				interaction.isRepliable() &&
				interaction.reply({
					embeds: [
						super
							.userEmbedError(interaction.member, translations.title())
							.setDescription(translations.description())
							.setFields([
								{ name: translations.fields[0].name(), value: blacklist.reason, inline: true },
								{
									name: translations.fields[1].name(),
									value: time(blacklist.timestamp, TimestampStyles.ShortDateTime),
									inline: true,
								},
							]),
					],
					flags: [MessageFlags.Ephemeral],
				})
			);
		}

		if (interaction.isAutocomplete()) {
			return this.client.autocompletes.get(interaction.commandName)?.execute({ interaction });
		}

		if (interaction.isCommand()) {
			const command = this.client.commands.get(interaction.commandName);
			const subcommands = this.client.subcommands.filter(
				(subcommand) => subcommand.data.parentCommandName === interaction.commandName,
			);

			if (subcommands.size > 0 && interaction.isChatInputCommand()) {
				const subcommandGroupName = interaction.options.getSubcommandGroup();
				const subcommandName = interaction.options.getSubcommand();

				if (subcommandGroupName) {
					const correnspondingSubcommand = subcommands.find(
						(subcommand) =>
							'parentSubcommandGroupName' in subcommand.data &&
							subcommand.data.parentSubcommandGroupName === subcommandGroupName &&
							subcommand.data.subcommandName === subcommandName,
					);

					if (correnspondingSubcommand) {
						return correnspondingSubcommand.execute({ interaction });
					}
				}

				if (subcommandName) {
					const correnspondingSubcommand = subcommands.find(
						(subcommand) => subcommand.data.subcommandName === subcommandName,
					);

					if (correnspondingSubcommand) {
						return correnspondingSubcommand.execute({ interaction });
					}
				}
			}

			if (command) {
				if (command.ownerOnly && interaction.user.id !== environment.DISCORD_OWNER_ID) {
					const translations = translate(interaction.locale).events.interactionCreate.ownerOnly;

					return interaction.reply({
						embeds: [
							super
								.userEmbedError(interaction.member)
								.setTitle(translations.title())
								.setDescription(translations.description()),
						],
						flags: [MessageFlags.Ephemeral],
					});
				}

				return command.execute({ interaction });
			}
		}

		if (interaction.isMessageComponent()) {
			const { customId } = super.extractCustomId(interaction.customId);
			return this.client.components.get(customId)?.execute({ interaction });
		}

		if (interaction.isModalSubmit()) {
			const { customId } = super.extractCustomId(interaction.customId);
			return this.client.modals.get(customId)?.execute({ interaction });
		}
	}
}
