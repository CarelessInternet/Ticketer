import type { BaseInteraction, Modal } from '@ticketer/djs-framework';
import { ChannelType, Colors } from 'discord.js';
import { automaticThreadsConfigurations, database, eq, userForumsConfigurations } from '@ticketer/database';
import { translate } from '@/i18n';

export async function renameTitle(
	this: BaseInteraction.Interaction,
	{ interaction }: Modal.Context,
	isAutomaticThreads = false,
) {
	const { channel, fields, locale, member } = interaction;
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

	if (!channel.editable) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(member, translations.renameTitle.modal.errors.notEditable.title()).setDescription(
					translations.renameTitle.modal.errors.notEditable.description(),
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

	const oldTitle = channel.name;
	const newTitle = fields.getTextInputValue('title');
	const successTranslations = translations.renameTitle.modal.success;
	const embed = this.userEmbed(member)
		.setColor(Colors.DarkGreen)
		.setTitle(successTranslations.title())
		.setDescription(successTranslations.description({ oldTitle, newTitle }));

	await channel.edit({ name: newTitle });
	await interaction.editReply({
		embeds: [embed],
	});
}
