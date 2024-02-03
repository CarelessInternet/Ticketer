import type { BaseInteraction, Modal } from '@ticketer/djs-framework';
import { ChannelType, Colors } from 'discord.js';
import { database, eq, userForumsConfigurations } from '@ticketer/database';
import { translate } from '@/i18n';

export async function renameTitle(this: BaseInteraction.Interaction, { interaction }: Modal.Context) {
	const { channel, fields, locale, member, user } = interaction;
	const translations = translate(locale).tickets.userForums.buttons;

	if (channel?.type !== ChannelType.PublicThread || channel.parent?.type !== ChannelType.GuildForum) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations._errorIfNotThreadChannel.title())
					.setDescription(translations._errorIfNotThreadChannel.description()),
			],
		});
	}

	if (!channel.editable) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations.renameTitle.modal.errors.notEditable.title())
					.setDescription(translations.renameTitle.modal.errors.notEditable.description()),
			],
		});
	}

	const [row] = await database
		.select({
			managers: userForumsConfigurations.managers,
		})
		.from(userForumsConfigurations)
		.where(eq(userForumsConfigurations.channelId, channel.parent.id));

	if (!row || (channel.ownerId !== user.id && !row.managers.some((id) => member.roles.resolve(id)))) {
		return interaction.editReply({
			embeds: [
				this.userEmbedError(user)
					.setTitle(translations._errorIfNotThreadAuthorOrManager.title())
					.setDescription(translations._errorIfNotThreadAuthorOrManager.description()),
			],
		});
	}

	const oldTitle = channel.name;
	const newTitle = fields.getTextInputValue('title');
	const successTranslations = translations.renameTitle.modal.success;
	const embed = this.userEmbed(user)
		.setColor(Colors.DarkGreen)
		.setTitle(successTranslations.title())
		.setDescription(successTranslations.description({ oldTitle, newTitle }));

	await channel.edit({ name: newTitle });
	await interaction.editReply({
		embeds: [embed],
	});
}
