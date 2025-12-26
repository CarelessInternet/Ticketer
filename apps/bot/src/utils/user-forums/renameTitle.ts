import { automaticThreadsConfigurations, database, eq, userForumsConfigurations } from '@ticketer/database';
import { type Modal, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { ChannelType, Colors } from 'discord.js';
import { translate } from '@/i18n';

export async function renameTitle({ interaction }: Modal.Context, isAutomaticThreads = false) {
	const { channel, client, fields, locale, member } = interaction;
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

	if (!channel.editable) {
		return interaction.editReply({
			embeds: [
				userEmbedError({
					client,
					description: translations.renameTitle.modal.errors.notEditable.description(),
					member,
					title: translations.renameTitle.modal.errors.notEditable.title(),
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

	const oldTitle = channel.name;
	const newTitle = fields.getTextInputValue('title');
	const successTranslations = translations.renameTitle.modal.success;
	const embed = userEmbed({ client, member })
		.setColor(Colors.DarkGreen)
		.setTitle(successTranslations.title())
		.setDescription(successTranslations.description({ oldTitle, newTitle }));

	await channel.edit({ name: newTitle });
	await interaction.editReply({
		embeds: [embed],
	});
}
