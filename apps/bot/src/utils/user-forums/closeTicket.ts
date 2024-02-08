import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { ChannelType, Colors } from 'discord.js';
import { automaticThreadsConfigurations, database, eq, userForumsConfigurations } from '@ticketer/database';
import { translate } from '@/i18n';

export async function closeTicket(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context | Component.Context,
	isAutomaticThreads = false,
) {
	const { channel, locale, member, user } = interaction;
	const translations = translate(locale).tickets[isAutomaticThreads ? 'automaticThreads' : 'userForums'].buttons;
	const table = isAutomaticThreads ? automaticThreadsConfigurations : userForumsConfigurations;

	if (
		channel?.type !== ChannelType.PublicThread ||
		channel.parent?.type !== (isAutomaticThreads ? ChannelType.GuildText : ChannelType.GuildForum)
	) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations._errorIfNotThreadChannel.title())
					.setDescription(translations._errorIfNotThreadChannel.description()),
			],
		});
	}

	if (channel.archived) return;

	if (!channel.editable) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations.close.execute.errors.notEditable.title())
					.setDescription(translations.close.execute.errors.notEditable.description()),
			],
		});
	}

	const [row] = await database
		.select({
			managers: table.managers,
		})
		.from(table)
		.where(eq(table.channelId, channel.parent.id));

	// eslint-disable-next-line unicorn/no-await-expression-member
	const ownerId = isAutomaticThreads ? (await channel.fetchStarterMessage())?.author.id : channel.ownerId;

	if (!row || (ownerId !== user.id && !row.managers.some((id) => member.roles.resolve(id)))) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations._errorIfNotThreadAuthorOrManager.title())
					.setDescription(translations._errorIfNotThreadAuthorOrManager.description()),
			],
		});
	}

	const embed = this.userEmbed(user)
		.setColor(Colors.Yellow)
		.setTitle(translations.close.execute.success.title())
		.setDescription(translations.close.execute.success.description());

	await channel.setArchived(true);
	await interaction.editReply({ embeds: [embed] });
}
