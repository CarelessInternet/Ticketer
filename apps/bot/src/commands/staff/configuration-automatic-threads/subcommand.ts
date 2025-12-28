import { automaticThreadsConfigurations, database, eq } from '@ticketer/database';
import { customId, DeferReply, Subcommand, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { getConfigurations, IsTextChannel, openingMessageModal } from './helpers';

export default class extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-automatic-threads',
		subcommandNames: ['overview'],
	});

	@DeferReply()
	public execute(context: Subcommand.Context) {
		void getConfigurations(context);
	}
}

export class Create extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-automatic-threads',
		subcommandNames: ['create'],
	});

	@IsTextChannel
	public execute(context: Subcommand.Context) {
		void openingMessageModal(context, { id: context.interaction.options.getChannel('channel', true).id });
	}
}

export class Edit extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-automatic-threads',
		subcommandNames: ['edit'],
	});

	@DeferReply()
	@IsTextChannel
	public async execute({ interaction }: Subcommand.Context) {
		const channel = interaction.options.getChannel('channel', true);
		const [result] = await database
			.select()
			.from(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.channelId, channel.id));

		if (!result) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: `The automatic threads configuration for the channel ${channel} could not be found. Please create one instead of editing it.`,
						member: interaction.member,
					}),
				],
			});
		}

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(customId('ticket_automatic_threads_configuration_menu', channel.id))
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder('Edit one of the following automatic threads options:')
			.setOptions(
				new StringSelectMenuOptionBuilder()
					.setEmoji('📔')
					.setLabel('Message Title & Description')
					.setDescription("Change the opening message's title and description.")
					.setValue('message_title_description'),
				new StringSelectMenuOptionBuilder()
					.setEmoji('🛡️')
					.setLabel('Ticket Managers')
					.setDescription('Choose the managers who are responsible for this text channel.')
					.setValue('managers'),
			);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);

		return interaction.editReply({ components: [row], content: channel.toString() });
	}
}

export class Delete extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-automatic-threads',
		subcommandNames: ['delete'],
	});

	@DeferReply()
	@IsTextChannel
	public async execute({ interaction }: Subcommand.Context) {
		const channel = interaction.options.getChannel('channel', true);
		await database
			.delete(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.channelId, channel.id));

		return interaction.editReply({
			embeds: [
				userEmbed(interaction)
					.setTitle('Deleted an Automatic Threads Configuration')
					.setDescription(
						`${interaction.member} deleted an automatic threads configuration in the channel ${channel} if one existed.`,
					),
			],
		});
	}
}
