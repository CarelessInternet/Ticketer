import { database, desc, guildBlacklists } from '@ticketer/database';
import { type Command, type Component, customId, embed } from '@ticketer/djs-framework';
import { translate } from '@/i18n';
import { formatDateShort, messageWithPagination, withPagination } from '@/utils';

export async function getBlacklists({ interaction }: Command.Context<'chat'> | Component.Context<'button'>, page = 0) {
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
