import { database, desc, eq, userForumsConfigurations } from '@ticketer/database';
import { type Command, type Component, container, customId, userEmbedError } from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
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
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { messageWithPagination, userForumsContainer, withPagination } from '@/utils';

export function IsForumChannel(_: object, __: string, descriptor: PropertyDescriptor) {
	const original = descriptor.value as () => void;

	descriptor.value = function (this: Command.Interaction, { interaction }: Command.Context<'chat'>) {
		const { type } = interaction.options.getChannel('channel', true);

		if (type !== ChannelType.GuildForum) {
			const embeds = [
				userEmbedError({
					client: interaction.client,
					description: 'The specified channel is not a forum channel.',
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

export async function getConfigurations(
	{ interaction }: Command.Context<'chat'> | Component.Context<'button'>,
	page = 0,
) {
	const PAGE_SIZE = 3;
	const configurations = await withPagination({
		page,
		pageSize: PAGE_SIZE,
		query: database
			.select()
			.from(userForumsConfigurations)
			.where(eq(userForumsConfigurations.guildId, interaction.guildId))
			.orderBy(desc(userForumsConfigurations.channelId))
			.$dynamic(),
	});

	const containers = configurations.map((config) =>
		container({
			builder: (cont) =>
				userForumsContainer({
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
		previous: { customId: customId('ticket_user_forums_view_previous', page), disabled: page === 0 },
		next: {
			customId: customId('ticket_user_forums_view_next', page),
			disabled: configurations.length < PAGE_SIZE,
		},
	});

	return interaction.editReply({ components: [...containers, ...pagination], flags: [MessageFlags.IsComponentsV2] });
}

export async function openingMessageModal(
	{ interaction }: Command.Context<'chat'> | Component.Context<'string'>,
	{ channelId, description, title }: { channelId?: string; title?: string; description?: string },
) {
	const channelInput = new LabelBuilder()
		.setLabel('Channel')
		.setDescription('The forum channel where the bot sends the message below to the user.')
		.setChannelSelectMenuComponent(
			// TODO: make this disabled in presence of a preset channel when Discord allows so.
			(channelId ? new ChannelSelectMenuBuilder().setDefaultChannels(channelId) : new ChannelSelectMenuBuilder())
				.setCustomId(customId('channel'))
				.setRequired(true)
				.setMinValues(1)
				.setMaxValues(1)
				.setChannelTypes(ChannelType.GuildForum),
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
		.setCustomId(customId('ticket_user_forums_configuration_opening_message'))
		.setTitle('Opening Message Title & Description')
		.setLabelComponents(channelInput, titleInput, descriptionInput);

	return interaction.showModal(modal).catch(() => false);
}

export function configurationMenu(channelId: string) {
	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId(customId('ticket_user_forums_configuration_menu', channelId))
		.setMinValues(1)
		.setMaxValues(1)
		.setPlaceholder('Edit one of the following user forum options:')
		.setOptions(
			new StringSelectMenuOptionBuilder()
				.setEmoji('📔')
				.setLabel('Message Title & Description')
				.setDescription("Change the opening message's title and description.")
				.setValue('message_title_description'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('🛡️')
				.setLabel('Ticket Managers')
				.setDescription('Choose the managers who are responsible for this forum.')
				.setValue('managers'),
		);

	return [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu)];
}
