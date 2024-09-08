import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { ChannelType, Colors } from 'discord.js';
import { automaticThreadsConfigurations, database, eq, userForumsConfigurations } from '@ticketer/database';
import { translate } from '@/i18n';

export async function closeTicket(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context | Component.Context,
	isAutomaticThreads = false,
) {
	const { channel, locale, member } = interaction;
	const translations = translate(locale).tickets[isAutomaticThreads ? 'automaticThreads' : 'userForums'].actions;
	const table = isAutomaticThreads ? automaticThreadsConfigurations : userForumsConfigurations;

	if (
		channel?.type !== ChannelType.PublicThread ||
		channel.parent?.type !== (isAutomaticThreads ? ChannelType.GuildText : ChannelType.GuildForum)
	) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(member, translations._errorIfNotThreadChannel.title()).setDescription(
					translations._errorIfNotThreadChannel.description(),
				),
			],
		});
	}

	if (channel.archived) return;

	if (!channel.editable) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(member, translations.close.execute.errors.notEditable.title()).setDescription(
					translations.close.execute.errors.notEditable.description(),
				),
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
		? // eslint-disable-next-line @typescript-eslint/no-empty-function, unicorn/no-await-expression-member
			(await channel.fetchStarterMessage().catch(() => {}))?.author.id
		: channel.ownerId;

	if (!row || (ownerId !== member.id && !row.managers.some((id) => member.roles.resolve(id)))) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(member, translations._errorIfNotThreadAuthorOrManager.title()).setDescription(
					translations._errorIfNotThreadAuthorOrManager.description(),
				),
			],
		});
	}

	const embed = this.userEmbed(member)
		.setColor(Colors.Yellow)
		.setTitle(translations.close.execute.success.title())
		.setDescription(translations.close.execute.success.description());

	await channel.setArchived(true);
	await interaction.editReply({ embeds: [embed] });
}
