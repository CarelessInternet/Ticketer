import { database, eq, guildBlacklists, guildBlacklistsInsertSchema } from '@ticketer/database';
import { DeferReply, Subcommand, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { inlineCode } from 'discord.js';
import { prettifyError } from 'zod';
import { translate } from '@/i18n';
import { formatDateShort, refreshGuildBlacklist } from '@/utils';
import { getBlacklists } from './helpers';

const dataTranslations = translate().commands['guild-blacklist'].data;

export default class extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: dataTranslations.name(),
		subcommandNames: [dataTranslations.subcommands[0].name()],
	});

	@DeferReply()
	public execute(context: Subcommand.Context) {
		void getBlacklists(context);
	}
}

export class Create extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: dataTranslations.name(),
		subcommandNames: [dataTranslations.subcommands[1].name()],
	});

	@DeferReply()
	public async execute({ interaction }: Subcommand.Context) {
		const { data, error, success } = guildBlacklistsInsertSchema.pick({ guildId: true, reason: true }).safeParse({
			guildId: interaction.options.getString(dataTranslations.subcommands[1].options[0].name(), true),
			reason: interaction.options.getString(dataTranslations.subcommands[1].options[1].name(), true),
		});
		const translations = translate(interaction.locale).commands['guild-blacklist'].command;

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: prettifyError(error),
						member: interaction.member,
						title: translations.errors.invalidFields.title(),
					}),
				],
			});
		}

		await database
			.insert(guildBlacklists)
			.values({ ...data })
			.onDuplicateKeyUpdate({ set: { reason: data.reason } });
		await refreshGuildBlacklist(this.client);

		return interaction.editReply({
			embeds: [
				userEmbed(interaction)
					.setTitle(translations.embeds.create.title())
					.setDescription(translations.embeds.create.description({ id: inlineCode(data.guildId) }))
					.setFields(
						{ name: translations.embeds.create.fields[0].name(), value: data.reason, inline: true },
						{ name: translations.embeds.create.fields[1].name(), value: formatDateShort(new Date()), inline: true },
					),
			],
		});
	}
}

export class Remove extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: dataTranslations.name(),
		subcommandNames: [dataTranslations.subcommands[1].name()],
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
