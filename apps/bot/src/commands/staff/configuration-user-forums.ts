import {
	ActionRowBuilder,
	ChannelType,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { type BaseInteraction, Command, type Component, DeferReply, Modal } from '@ticketer/djs-framework';
import { count, database, eq, userForumsConfigurations } from '@ticketer/database';

function openingMessageModal<T>(
	this: BaseInteraction.Interaction,
	{ interaction }: Command.Context<'chat'> | Component.Context,
	options: { id: T; title?: string; description?: string },
) {
	const titleInput = (options.title ? new TextInputBuilder().setValue(options.title) : new TextInputBuilder())
		.setCustomId(this.customId('title'))
		.setLabel('Message Title')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('Write "{member}" to mention the user.');
	const descriptionInput = (
		options.description ? new TextInputBuilder().setValue(options.description) : new TextInputBuilder()
	)
		.setCustomId(this.customId('description'))
		.setLabel('Message Description')
		.setRequired(true)
		.setMinLength(1)
		.setMaxLength(500)
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('Write "{member}" to mention the user.');

	const row1 = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
	const row2 = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionInput);

	const modal = new ModalBuilder()
		.setCustomId(this.customId('ticket_user_forums_opening_message_modal', options.id))
		.setTitle('Opening Message Title, & Description')
		.setComponents(row1, row2);

	return interaction.showModal(modal);
}

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('configuration-user-forums')
		.setDescription('Edit the configuration for when a thread is created in a forum by a member.')
		.setDefaultMemberPermissions(
			PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageThreads,
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('overview').setDescription('View the current configurations for user forums.'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a new configuration for user forums assisted by the bot.')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The forum channel where the bot assists with support for the user.')
						.addChannelTypes(ChannelType.GuildForum)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit a configuration user threads in a forum channel.')
				.addStringOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel to edit the configuration for.')
						.setAutocomplete(true)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('delete')
				.setDescription('Delete a user forum configuration.')
				.addStringOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel to delete the configuration for.')
						.setAutocomplete(true)
						.setRequired(true),
				),
		);

	public execute(context: Command.Context<'chat'>) {
		switch (context.interaction.options.getSubcommand(true)) {
			case 'create': {
				this.createConfiguration(context);
				return;
			}
			default: {
				return context.interaction.reply({
					embeds: [super.userEmbedError(context.interaction.user).setDescription('The subcommand could not be found.')],
					ephemeral: true,
				});
			}
		}
	}

	private createConfiguration(context: Command.Context<'chat'>) {
		const { id, type } = context.interaction.options.getChannel('channel', true);

		if (type !== ChannelType.GuildForum) return;

		void openingMessageModal.call(this, context, { id });
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [super.dynamicCustomId('ticket_user_forums_opening_message_modal')];

	public execute(context: Modal.Context) {
		const { customId } = super.extractCustomId(context.interaction.customId);

		switch (customId) {
			case super.dynamicCustomId('ticket_user_forums_opening_message_modal'): {
				return this.createConfigurationOrUpdateOpeningMessage(context);
			}
			default: {
				return context.interaction.reply({
					embeds: [
						super.userEmbedError(context.interaction.user).setDescription('The modal custom ID could not be found.'),
					],
					ephemeral: true,
				});
			}
		}
	}

	@DeferReply(false)
	private async createConfigurationOrUpdateOpeningMessage({ interaction }: Modal.Context) {
		const { dynamicValue } = super.extractCustomId(interaction.customId, true);
		const channel = await interaction.guild.channels.fetch(dynamicValue);

		if (!channel || channel.type !== ChannelType.GuildForum) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.user).setDescription('The channel is not a forum channel.')],
			});
		}

		const title = interaction.fields.getTextInputValue('title');
		const description = interaction.fields.getTextInputValue('description');

		const inserted = await database.transaction(async (tx) => {
			const [row] = await tx
				.select({ amount: count() })
				.from(userForumsConfigurations)
				.where(eq(userForumsConfigurations.channelId, dynamicValue));

			if (!row || row.amount > 0) return false;

			await tx.insert(userForumsConfigurations).values({
				channelId: dynamicValue,
				guildId: interaction.guildId,
				openingMessageTitle: title,
				openingMessageDescription: description,
			});

			return true;
		});

		return interaction.editReply({
			embeds: [
				inserted
					? super
							.userEmbed(interaction.user)
							.setTitle('Created a User Forum Configuration')
							.setDescription(
								// eslint-disable-next-line @typescript-eslint/no-base-to-string
								`${interaction.user.toString()} created a new user forum configuration in ${channel.toString()} with the following opening message details:`,
							)
							.setFields(
								// TODO: move fields to a new embed just like welcome and farewell, as well as parsing "{member}".
								{
									name: 'Title',
									value: title,
								},
								{
									name: 'Description',
									value: description,
								},
							)
					: super.userEmbedError(interaction.user).setDescription(
							// eslint-disable-next-line @typescript-eslint/no-base-to-string
							`The user forum configuration for the channel ${channel.toString()} already exists, please edit it instead.`,
						),
			],
		});
	}
}
