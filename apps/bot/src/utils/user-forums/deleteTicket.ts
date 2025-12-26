import { automaticThreadsConfigurations, database, eq, userForumsConfigurations } from '@ticketer/database';
import { type Command, type Component, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { ChannelType, Colors } from 'discord.js';
import { translate } from '@/i18n';

export async function deleteTicket({ interaction }: Command.Context | Component.Context, isAutomaticThreads = false) {
	const { channel, client, locale, member } = interaction;
	const translations = translate(locale).tickets[isAutomaticThreads ? 'automaticThreads' : 'userForums'].actions;
	const table = isAutomaticThreads ? automaticThreadsConfigurations : userForumsConfigurations;

	if (
		channel?.type !== ChannelType.PublicThread ||
		channel.parent?.type !== (isAutomaticThreads ? ChannelType.GuildText : ChannelType.GuildForum)
	) {
		return interaction.editReply({
			embeds: [
				userEmbedError({
					client,
					description: translations._errorIfNotThreadChannel.description(),
					member,
					title: translations._errorIfNotThreadChannel.title(),
				}),
			],
		});
	}

	if (!channel.manageable) {
		return interaction.editReply({
			embeds: [
				userEmbedError({
					client,
					description: translations.lock.execute.errors.notManageable.description(),
					member,
					title: translations.lock.execute.errors.notManageable.title(),
				}),
			],
		});
	}

	const [row] = await database
		.select({
			managers: table.managers,
		})
		.from(table)
		.where(eq(table.channelId, channel.parent.id));

	const ownerId = isAutomaticThreads
		? (await channel.fetchStarterMessage().catch(() => {}))?.author.id
		: channel.ownerId;

	if (!row || (ownerId !== member.id && !row.managers.some((id) => member.roles.resolve(id)))) {
		return interaction.editReply({
			embeds: [
				userEmbedError({
					client,
					description: translations._errorIfNotThreadAuthorOrManager.description(),
					member,
					title: translations._errorIfNotThreadAuthorOrManager.title(),
				}),
			],
		});
	}

	const embed = userEmbed({ client, member })
		.setColor(Colors.Red)
		.setTitle(translations.delete.execute.success.title())
		.setDescription(translations.delete.execute.success.description());

	await interaction.editReply({ embeds: [embed] });
	await channel.delete();
}
