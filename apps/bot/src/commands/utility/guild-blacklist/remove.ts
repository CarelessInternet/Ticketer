import { database, eq, guildBlacklists } from '@ticketer/database';
import { DeferReply, Subcommand, userEmbed } from '@ticketer/djs-framework';
import { inlineCode } from 'discord.js';
import { translate } from '@/i18n';
import { refreshGuildBlacklist } from '@/utils';

const dataTranslations = translate().commands['guild-blacklist'].data;

export default class extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: dataTranslations.name(),
		subcommandName: dataTranslations.subcommands[1].name(),
	});

	@DeferReply()
	public async execute({ interaction }: Subcommand.Context) {
		const id = interaction.options.getString(dataTranslations.subcommands[2].options[0].name(), true);
		const translations = translate(interaction.locale).commands['guild-blacklist'].command.embeds.delete;

		await database.delete(guildBlacklists).where(eq(guildBlacklists.guildId, id));
		await refreshGuildBlacklist(this.client);

		return interaction.editReply({
			embeds: [
				userEmbed(interaction)
					.setTitle(translations.title())
					.setDescription(translations.description({ id: inlineCode(id), member: interaction.member.toString() })),
			],
		});
	}
}
