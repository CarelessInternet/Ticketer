import { automaticThreadsConfigurations, database, desc, eq } from '@ticketer/database';
import { type Component, container, customId, type Subcommand, userEmbedError } from '@ticketer/djs-framework';
import {
	bold,
	ChannelSelectMenuBuilder,
	ChannelType,
	channelMention,
	HeadingLevel,
	heading,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	roleMention,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { automaticThreadsContainer, messageWithPagination, withPagination } from '@/utils';

export function IsTextChannel(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = function (this: Subcommand.Interaction, { interaction }: Subcommand.Context) {
		const { type } = interaction.options.getChannel('channel', true);

		if (type !== ChannelType.GuildText) {
			const embeds = [
				userEmbedError({
					client: interaction.client,
					description: 'The specified channel is not a text channel.',
					member: interaction.member,
				}),
			];

			return interaction.deferred ? interaction.editReply({ embeds }) : interaction.reply({ embeds });
		}

		// biome-ignore lint/complexity/noArguments: It is convenient.
		return Reflect.apply(original, this, arguments) as () => unknown;
	};

	return descriptor;
}

export async function getConfigurations({ interaction }: Subcommand.Context | Component.Context<'button'>, page = 0) {
	const PAGE_SIZE = 3;
	const configurations = await withPagination({
		page,
		pageSize: PAGE_SIZE,
		query: database
			.select()
			.from(automaticThreadsConfigurations)
			.where(eq(automaticThreadsConfigurations.guildId, interaction.guildId))
			.orderBy(desc(automaticThreadsConfigurations.channelId))
			.$dynamic(),
	});

	const containers = configurations.map((config) =>
		container({
			builder: (cont) =>
				automaticThreadsContainer({
					container: cont
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(`${bold('Channel')}: ${channelMention(config.channelId)}`),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Managers')}: ${config.managers.length > 0 ? config.managers.map((id) => roleMention(id)).join(', ') : 'None'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)),
						)
						.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
					description: config.openingMessageDescription,
					member: interaction.member,
					title: config.openingMessageTitle,
				}),
			client: interaction.client,
		}),
	);

	const pagination = messageWithPagination({
		previous: { customId: customId('ticket_automatic_threads_view_previous', page), disabled: page === 0 },
		next: {
			customId: customId('ticket_automatic_threads_view_next', page),
			disabled: configurations.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({ components: [...containers, ...pagination], flags: [MessageFlags.IsComponentsV2] });
}

export async function openingMessageModal(
	{ interaction }: Subcommand.Context | Component.Context<'string'>,
	{ channelId, description, title }: { channelId?: string; title?: string; description?: string },
) {
	const channelInput = new LabelBuilder()
		.setLabel('Channel')
		.setDescription("The text channel where the bot creates a thread from the user's message.")
		.setChannelSelectMenuComponent(
			// TODO: make this disabled in presence of a preset channel when Discord allows so.
			(channelId ? new ChannelSelectMenuBuilder().setDefaultChannels(channelId) : new ChannelSelectMenuBuilder())
				.setCustomId(customId('channel'))
				.setRequired(true)
				.setMinValues(1)
				.setMaxValues(1)
				.setChannelTypes(ChannelType.GuildText),
		);
	const titleInput = new LabelBuilder()
		.setLabel('Message Title')
		.setDescription('Write "{member}" to mention the user.')
		.setTextInputComponent(
			(title ? new TextInputBuilder().setValue(title) : new TextInputBuilder())
				.setCustomId(customId('title'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(100)
				.setStyle(TextInputStyle.Short),
		);

	const descriptionInput = new LabelBuilder()
		.setLabel('Message Description')
		.setDescription('Write "{member}" to mention the user.')
		.setTextInputComponent(
			(description ? new TextInputBuilder().setValue(description) : new TextInputBuilder())
				.setCustomId(customId('description'))
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(500)
				.setStyle(TextInputStyle.Paragraph),
		);

	const modal = new ModalBuilder()
		.setCustomId(customId('ticket_automatic_threads_configuration_opening_message'))
		.setTitle('Opening Message Title & Description')
		.setLabelComponents([channelInput, titleInput, descriptionInput].filter((input) => !!input));

	return interaction.showModal(modal).catch(() => false);
}
