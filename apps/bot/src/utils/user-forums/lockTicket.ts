import type { BaseInteraction, Command, Component } from '@ticketer/djs-framework';
import { ChannelType, Colors } from 'discord.js';
import { automaticThreadsConfigurations, database, eq, userForumsConfigurations } from '@ticketer/database';
import { translate } from '@/i18n';

export async function lockTicket(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context | Component.Context,
	lockAndClose = false,
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

	// This is here just in case somebody bypassed the disabled buttons in locked threads.
	if (channel.locked) return;

	if (lockAndClose ? !channel.manageable || !channel.editable : !channel.manageable) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(
						lockAndClose
							? translations.lockAndClose.execute.errors.notManageableAndEditable.title()
							: translations.lock.execute.errors.notManageable.title(),
					)
					.setDescription(
						lockAndClose
							? translations.lockAndClose.execute.errors.notManageableAndEditable.description()
							: translations.lock.execute.errors.notManageable.description(),
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

	if (!row || (channel.ownerId !== user.id && !row.managers.some((id) => member.roles.resolve(id)))) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations._errorIfNotThreadAuthorOrManager.title())
					.setDescription(translations._errorIfNotThreadAuthorOrManager.description()),
			],
		});
	}

	const embed = this.userEmbed(user)
		.setColor(Colors.DarkVividPink)
		.setTitle(translations[lockAndClose ? 'lockAndClose' : 'lock'].execute.success.title())
		.setDescription(translations[lockAndClose ? 'lockAndClose' : 'lock'].execute.success.description());

	await channel.edit({
		locked: true,
		...(lockAndClose && { archived: true }),
	});
	await interaction.editReply({ embeds: [embed] });
}
