import { database, desc, eq, guildBlacklists, guildBlacklistsInsertSchema } from '@ticketer/database';
import {
	Command,
	Component,
	customId,
	DeferReply,
	DeferUpdate,
	dynamicCustomId,
	embed,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import { inlineCode, PermissionFlagsBits } from 'discord.js';
import { prettifyError } from 'zod';
import { getTranslations, translate } from '@/i18n';
import { formatDateShort, goToPage, messageWithPagination, refreshGuildBlacklist, withPagination } from '@/utils';

async function getBlacklists({ interaction }: Command.Context<'chat'> | Component.Context<'button'>, page = 0) {
	const PAGE_SIZE = 5;
	const blacklists = await withPagination({
		page,
		pageSize: PAGE_SIZE,
		query: database.select().from(guildBlacklists).orderBy(desc(guildBlacklists.timestamp)).$dynamic(),
	});

	const translations = translate(interaction.locale).commands['guild-blacklist'].command.embeds.overview;
	const embeds = blacklists.map((blacklist) =>
		embed(interaction)
			.setTitle(translations.title({ id: blacklist.guildId }))
			.setFields(
				{ name: translations.fields[0].name(), value: blacklist.reason, inline: true },
				{ name: translations.fields[1].name(), value: formatDateShort(blacklist.timestamp), inline: true },
			),
	);

	const components = messageWithPagination({
		previous: { customId: customId('guild_blacklist_view_previous', page), disabled: page === 0 },
		next: {
			customId: customId('guild_blacklist_view_next', page),
			disabled: blacklists.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({ components, embeds });
}

const dataTranslations = translate().commands['guild-blacklist'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.guild-blacklist.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.guild-blacklist.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(dataTranslations.subcommands[0].name())
				.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.0.name'))
				.setDescription(dataTranslations.subcommands[0].description())
				.setDescriptionLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.0.description')),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(dataTranslations.subcommands[1].name())
				.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.1.name'))
				.setDescription(dataTranslations.subcommands[1].description())
				.setDescriptionLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.1.description'))
				.addStringOption((option) =>
					option
						.setName(dataTranslations.subcommands[1].options[0].name())
						.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.1.options.0.name'))
						.setDescription(dataTranslations.subcommands[1].options[0].description())
						.setDescriptionLocalizations(
							getTranslations('commands.guild-blacklist.data.subcommands.1.options.0.description'),
						)
						.setRequired(true)
						.setMinLength(17),
				)
				.addStringOption((option) =>
					option
						.setName(dataTranslations.subcommands[1].options[1].name())
						.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.1.options.1.name'))
						.setDescription(dataTranslations.subcommands[1].options[1].description())
						.setDescriptionLocalizations(
							getTranslations('commands.guild-blacklist.data.subcommands.1.options.1.description'),
						)
						.setRequired(true)
						.setMinLength(1)
						.setMaxLength(500),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(dataTranslations.subcommands[2].name())
				.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.2.name'))
				.setDescription(dataTranslations.subcommands[2].description())
				.setDescriptionLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.2.description'))
				.addStringOption((option) =>
					option
						.setName(dataTranslations.subcommands[2].options[0].name())
						.setNameLocalizations(getTranslations('commands.guild-blacklist.data.subcommands.2.options.0.name'))
						.setDescription(dataTranslations.subcommands[2].options[0].description())
						.setDescriptionLocalizations(
							getTranslations('commands.guild-blacklist.data.subcommands.2.options.0.description'),
						)
						.setRequired(true)
						.setMinLength(17),
				),
		);
	public readonly ownerOnly = true;
	public readonly guildOnly = true;

	public execute(context: Command.Context<'chat'>) {
		switch (context.interaction.options.getSubcommand(true)) {
			case dataTranslations.subcommands[0].name(): {
				return this.getBlacklists(context);
			}
			case dataTranslations.subcommands[1].name(): {
				return this.addBlacklist(context);
			}
			case dataTranslations.subcommands[2].name(): {
				return this.removeBlacklist(context);
			}
		}
	}

	@DeferReply()
	private getBlacklists(context: Command.Context<'chat'>) {
		void getBlacklists(context);
	}

	@DeferReply()
	private async addBlacklist({ interaction }: Command.Context<'chat'>) {
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

	@DeferReply()
	private async removeBlacklist({ interaction }: Command.Context<'chat'>) {
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

export class PaginationInteraction extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('guild_blacklist_view_previous'),
		dynamicCustomId('guild_blacklist_view_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context<'button'>) {
		const { success, error, page } = goToPage(context.interaction);

		if (!success) {
			return context.interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({
						client: context.interaction.client,
						description: error,
						member: context.interaction.member,
						title: translate(context.interaction.locale).commands[
							'guild-blacklist'
						].command.errors.invalidFields.title(),
					}),
				],
			});
		}

		void getBlacklists(context, page);
	}
}
