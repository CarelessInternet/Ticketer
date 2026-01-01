import { automaticThreadsConfigurations, database, eq } from '@ticketer/database';
import { DeferReply, Subcommand, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { configurationMenu, getConfigurations, IsTextChannel, openingMessageModal } from './helpers';

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

	public execute(context: Subcommand.Context) {
		void openingMessageModal(context, {});
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

		return interaction.editReply({ components: configurationMenu(channel.id), content: channel.toString() });
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
