import {
	automaticThreadsConfigurations,
	automaticThreadsConfigurationsInsertSchema,
	database,
} from '@ticketer/database';
import { container, customId, DeferUpdate, Modal, userEmbedError } from '@ticketer/djs-framework';
import { ChannelType, HeadingLevel, heading, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { prettifyError } from 'zod';
import { automaticThreadsContainer } from '@/utils';
import { configurationMenu } from './helpers';

export default class extends Modal.Interaction {
	public readonly customIds = [customId('ticket_automatic_threads_configuration_opening_message')];

	@DeferUpdate
	public async execute({ interaction }: Modal.Context) {
		const channel = interaction.fields.getSelectedChannels('channel', true).at(0);

		if (channel?.type !== ChannelType.GuildText) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'The channel is not a text channel.',
						member: interaction.member,
					}),
				],
			});
		}

		const { data, error, success } = automaticThreadsConfigurationsInsertSchema
			.pick({ openingMessageDescription: true, openingMessageTitle: true })
			.safeParse({
				openingMessageDescription: interaction.fields.getTextInputValue('description'),
				openingMessageTitle: interaction.fields.getTextInputValue('title'),
			});

		if (!success) {
			interaction.editReply({
				components: [],
				content: '',
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
			return interaction.followUp({ components: configurationMenu(channel.id) });
		}

		await database
			.insert(automaticThreadsConfigurations)
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
									heading('Created/Updated an Automatic Threads Configuration', HeadingLevel.One),
								),
							)
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									`${interaction.member.toString()} created or updated an automatic threads configuration in ${channel.toString()}. An example opening message can be seen in the container below.`,
								),
							),
					client: interaction.client,
				}),
				container({
					builder: automaticThreadsContainer({
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
		return interaction.followUp({ components: configurationMenu(channel.id) });
	}
}
