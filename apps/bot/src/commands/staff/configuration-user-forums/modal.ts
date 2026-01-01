import { database, userForumsConfigurations, userForumsConfigurationsInsertSchema } from '@ticketer/database';
import { container, customId, Modal, userEmbedError } from '@ticketer/djs-framework';
import { ChannelType, HeadingLevel, heading, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { prettifyError } from 'zod';
import { userForumsContainer } from '@/utils';
import { configurationMenu } from './helpers';

export default class extends Modal.Interaction {
	public readonly customIds = [customId('ticket_user_forums_configuration_opening_message')];

	public async execute({ interaction }: Modal.Context) {
		const channel = interaction.fields.getSelectedChannels('channel', true).at(0);

		if (channel?.type !== ChannelType.GuildForum) {
			return interaction.reply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'The channel is not a forum channel.',
						member: interaction.member,
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		const { data, error, success } = userForumsConfigurationsInsertSchema
			.pick({ openingMessageDescription: true, openingMessageTitle: true })
			.safeParse({
				openingMessageDescription: interaction.fields.getTextInputValue('description'),
				openingMessageTitle: interaction.fields.getTextInputValue('title'),
			});

		if (!success) {
			interaction.reply({
				components: [],
				content: '',
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
				flags: [MessageFlags.Ephemeral],
			});
			return interaction.followUp({ components: configurationMenu(channel.id), content: interaction.message?.content });
		}

		await interaction.deferUpdate();
		await database
			.insert(userForumsConfigurations)
			.values({
				channelId: channel.id,
				guildId: interaction.guildId,
				openingMessageTitle: data.openingMessageTitle,
				openingMessageDescription: data.openingMessageDescription,
			})
			.onDuplicateKeyUpdate({
				set: {
					openingMessageTitle: data.openingMessageTitle,
					openingMessageDescription: data.openingMessageDescription,
				},
			});

		interaction.editReply({
			components: [
				container({
					builder: (cont) =>
						cont
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									heading('Created/Updated a User Forum Configuration', HeadingLevel.One),
								),
							)
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									`${interaction.member} created or updated a user forum configuration in ${channel}. An example opening message can be seen in the container below.`,
								),
							),
					client: interaction.client,
				}),
				container({
					builder: userForumsContainer({
						description: data.openingMessageDescription,
						member: interaction.member,
						title: data.openingMessageTitle,
					}),
					client: interaction.client,
				}),
			],
			content: '',
			flags: [MessageFlags.IsComponentsV2],
		});
		return interaction.followUp({ components: configurationMenu(channel.id), content: interaction.message?.content });
	}
}
