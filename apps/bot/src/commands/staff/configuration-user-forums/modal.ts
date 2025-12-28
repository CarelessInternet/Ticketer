import { database, userForumsConfigurations, userForumsConfigurationsInsertSchema } from '@ticketer/database';
import {
	container,
	DeferReply,
	dynamicCustomId,
	extractCustomId,
	Modal,
	userEmbedError,
} from '@ticketer/djs-framework';
import { ChannelType, HeadingLevel, heading, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { prettifyError } from 'zod';
import { fetchChannel, userForumsContainer } from '@/utils';

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_user_forums_configuration_opening_message')];

	@DeferReply()
	public async execute({ interaction }: Modal.Context) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const channel = await fetchChannel(interaction.guild, dynamicValue);

		if (channel?.type !== ChannelType.GuildForum) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'The channel is not a forum channel.',
						member: interaction.member,
					}),
				],
			});
		}

		const { data, error, success } = userForumsConfigurationsInsertSchema
			.pick({ openingMessageDescription: true, openingMessageTitle: true })
			.safeParse({
				openingMessageDescription: interaction.fields.getTextInputValue('description'),
				openingMessageTitle: interaction.fields.getTextInputValue('title'),
			});

		if (!success) {
			return interaction.editReply({
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		await database
			.insert(userForumsConfigurations)
			.values({
				channelId: dynamicValue,
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

		return interaction.editReply({
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
			flags: [MessageFlags.IsComponentsV2],
		});
	}
}
