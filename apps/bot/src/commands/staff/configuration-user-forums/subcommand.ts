import { database, eq, userForumsConfigurations } from '@ticketer/database';
import { DeferReply, Subcommand, userEmbed, userEmbedError } from '@ticketer/djs-framework';
import { configurationMenu, getConfigurations, IsForumChannel, openingMessageModal } from './helpers';

export default class extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-user-forums',
		subcommandNames: ['overview'],
	});

	@DeferReply()
	public execute(context: Subcommand.Context) {
		void getConfigurations(context);
	}
}

export class Create extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-user-forums',
		subcommandNames: ['create'],
	});

	public execute(context: Subcommand.Context) {
		void openingMessageModal(context, {});
	}
}

export class Edit extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-user-forums',
		subcommandNames: ['edit'],
	});

	@DeferReply()
	@IsForumChannel
	public async execute({ interaction }: Subcommand.Context) {
		const channel = interaction.options.getChannel('channel', true);
		const [result] = await database
			.select()
			.from(userForumsConfigurations)
			.where(eq(userForumsConfigurations.channelId, channel.id));

		if (!result) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: `The user forum configuration for the channel ${channel} could not be found. Please create one instead of editing it.`,
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
		parentCommandName: 'configuration-user-forums',
		subcommandNames: ['delete'],
	});

	@DeferReply()
	@IsForumChannel
	public async execute({ interaction }: Subcommand.Context) {
		const channel = interaction.options.getChannel('channel', true);
		await database.delete(userForumsConfigurations).where(eq(userForumsConfigurations.channelId, channel.id));

		return interaction.editReply({
			embeds: [
				userEmbed(interaction)
					.setTitle('Deleted a User Forum Configuration')
					.setDescription(
						`${interaction.member} deleted a user forum configuration in the channel ${channel} if one existed.`,
					),
			],
		});
	}
}
