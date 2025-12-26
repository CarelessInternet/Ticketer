import { database, eq, not, welcomeAndFarewell, welcomeAndFarewellInsertSchema } from '@ticketer/database';
import {
	Command,
	Component,
	container,
	customId,
	DeferReply,
	DeferUpdate,
	extractCustomId,
	Modal,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	bold,
	ChannelSelectMenuBuilder,
	ChannelType,
	channelMention,
	HeadingLevel,
	heading,
	inlineCode,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	PermissionFlagsBits,
	RoleSelectMenuBuilder,
	roleMention,
	SeparatorBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { prettifyError } from 'zod';
import { farewellContainer, welcomeContainer } from '@/utils';

type InsertWithoutGuildId = Omit<typeof welcomeAndFarewell.$inferInsert, 'guildId'>;

const capitalise = <T extends string>(text: T) =>
	text.replace(/./, (character) => character.toUpperCase()) as Capitalize<T>;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('configuration-welcome-farewell')
		.setDescription('Edit the configuration for welcome and farewell messages.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels)
		.addSubcommand((subcommand) =>
			subcommand.setName('settings').setDescription('Edit the settings of welcome and farewell messages.'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('overview')
				.setDescription('View the current configuration for welcome and farewell messages.'),
		);

	@DeferReply()
	public async execute({ interaction }: Command.Context<'chat'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'settings': {
				const welcomeSelectMenu = new StringSelectMenuBuilder()
					.setCustomId(customId('welcome_configuration'))
					.setMinValues(1)
					.setMaxValues(1)
					.setPlaceholder('Edit one of the following welcome options:')
					.setOptions(
						new StringSelectMenuOptionBuilder()
							.setEmoji('#️⃣')
							.setLabel('Channel')
							.setDescription('Change the channel where welcome messages get sent.')
							.setValue('channel'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('📘')
							.setLabel('Message Title')
							.setDescription('Change the title used in welcome messages.')
							.setValue('title'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('📜')
							.setLabel('Message Description')
							.setDescription('Change the description used in welcome messages.')
							.setValue('description'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('🛡️')
							.setLabel('Roles')
							.setDescription('Give new members specific roles.')
							.setValue('roles'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('🔌')
							.setLabel('Enabled/Disabled')
							.setDescription('Toggle between turning welcome messages on and off.')
							.setValue('enabled'),
					);

				const farewellSelectMenu = new StringSelectMenuBuilder()
					.setCustomId(customId('farewell_configuration'))
					.setMinValues(1)
					.setMaxValues(1)
					.setPlaceholder('Edit one of the following farewell options:')
					.setOptions(
						new StringSelectMenuOptionBuilder()
							.setEmoji('#️⃣')
							.setLabel('Channel')
							.setDescription('Change the channel where farewell messages get sent.')
							.setValue('channel'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('📘')
							.setLabel('Message Title')
							.setDescription('Change the title used in farewell messages.')
							.setValue('title'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('📜')
							.setLabel('Message Description')
							.setDescription('Change the description used in farewell messages.')
							.setValue('description'),
						new StringSelectMenuOptionBuilder()
							.setEmoji('🔌')
							.setLabel('Enabled/Disabled')
							.setDescription('Toggle between turning farewell messages on and off.')
							.setValue('enabled'),
					);

				const welcomeRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(welcomeSelectMenu);
				const farewellRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(farewellSelectMenu);

				return interaction.editReply({ components: [welcomeRow, farewellRow] });
			}
			case 'overview': {
				const { guildId, guildLocale } = interaction;
				const [result] = await database
					.select()
					.from(welcomeAndFarewell)
					.where(eq(welcomeAndFarewell.guildId, guildId))
					.limit(1);

				if (!result) {
					return interaction.editReply({
						embeds: [
							userEmbedError({
								client: interaction.client,
								description: 'No welcome/farewell configuration could be found.',
								member: interaction.member,
							}),
						],
					});
				}

				const welcome = container({
					builder: (cont) =>
						welcomeContainer({
							container: cont
								.addTextDisplayComponents(
									new TextDisplayBuilder().setContent(
										heading(`Welcome Messages: ${result.welcomeEnabled ? 'Enabled' : 'Disabled'}`, HeadingLevel.One),
									),
								)
								.addTextDisplayComponents(
									new TextDisplayBuilder().setContent(
										`${bold('Welcome Channel')}: ${result.welcomeChannelId ? channelMention(result.welcomeChannelId) : 'None'}`,
									),
								)
								.addTextDisplayComponents(
									new TextDisplayBuilder().setContent(
										`${bold('New Member Roles')}: ${
											result.welcomeNewMemberRoles.length > 0
												? result.welcomeNewMemberRoles.map((role) => roleMention(role)).join(', ')
												: 'None'
										}`,
									),
								)
								.addTextDisplayComponents(
									new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)),
								)
								.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
							data: {
								welcomeMessageTitle: result.welcomeMessageTitle,
								welcomeMessageDescription: result.welcomeMessageDescription,
							},
							locale: guildLocale,
							member: interaction.member,
						}),
					client: interaction.client,
				});

				const farewell = container({
					builder: (cont) =>
						farewellContainer({
							container: cont
								.addTextDisplayComponents(
									new TextDisplayBuilder().setContent(
										heading(`Farewell Messages: ${result.farewellEnabled ? 'Enabled' : 'Disabled'}`, HeadingLevel.One),
									),
								)
								.addTextDisplayComponents(
									new TextDisplayBuilder().setContent(
										`${bold('Farewell Channel')}: ${result.farewellChannelId ? channelMention(result.farewellChannelId) : 'None'}`,
									),
								)
								.addTextDisplayComponents(
									new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)),
								)
								.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
							data: {
								farewellMessageTitle: result.farewellMessageTitle,
								farewellMessageDescription: result.farewellMessageDescription,
							},
							locale: guildLocale,
							member: interaction.member,
						}),
					client: interaction.client,
				});

				return interaction.editReply({ components: [welcome, farewell], flags: [MessageFlags.IsComponentsV2] });
			}
			default: {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: 'The subcommand could not be found.',
							member: interaction.member,
						}),
					],
				});
			}
		}
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		customId('welcome_configuration'),
		customId('welcome_configuration_channel'),
		customId('welcome_configuration_roles'),
		customId('farewell_configuration'),
		customId('farewell_configuration_channel'),
	];

	public execute({ interaction }: Component.Context) {
		const { customId: id } = extractCustomId(interaction.customId);

		switch (id) {
			case customId('welcome_configuration'):
			case customId('farewell_configuration'): {
				return interaction.isStringSelectMenu() && void this.welcomeAndFarewellConfiguration({ interaction });
			}
			case customId('welcome_configuration_channel'):
			case customId('farewell_configuration_channel'): {
				return interaction.isChannelSelectMenu() && void this.welcomeAndFarewellConfigurationChannel({ interaction });
			}
			case customId('welcome_configuration_roles'): {
				return interaction.isRoleSelectMenu() && void this.welcomeConfigurationRoles({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: 'The select menu ID could not be found.',
							member: interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	private welcomeAndFarewellConfiguration({ interaction }: Component.Context<'string'>) {
		const { customId: id } = extractCustomId(interaction.customId);
		const type = id.includes('welcome_configuration') ? 'welcome' : 'farewell';
		const value = interaction.values.at(0);

		switch (value) {
			case 'channel': {
				const channelSelectMenu = new ChannelSelectMenuBuilder()
					.setCustomId(customId(`${type}_configuration_channel`))
					.setMinValues(1)
					.setMaxValues(1)
					.setPlaceholder(`Choose a channel for ${type} messages.`)
					.setChannelTypes(ChannelType.GuildText);

				const channelRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(channelSelectMenu);

				return interaction.reply({ components: [channelRow] });
			}
			case 'title': {
				const titleInput = new LabelBuilder()
					.setLabel('Message Title')
					.setDescription('Write "{member}" to mention the user in the title.')
					.setTextInputComponent(
						new TextInputBuilder()
							.setCustomId(customId('message_title'))
							.setRequired(false)
							.setMinLength(1)
							.setMaxLength(100)
							.setStyle(TextInputStyle.Short),
					);

				const titleModal = new ModalBuilder()
					.setCustomId(customId(`${type}_message_title`))
					.setTitle(`${capitalise(type)} Message Title`)
					.setLabelComponents(titleInput);

				return interaction.showModal(titleModal);
			}
			case 'description': {
				const descriptionInput = new LabelBuilder()
					.setLabel('Message Description')
					.setDescription('Write "{member}" to mention the user in the description.')
					.setTextInputComponent(
						new TextInputBuilder()
							.setCustomId(customId('message_description'))
							.setRequired(false)
							.setMinLength(1)
							.setMaxLength(500)
							.setStyle(TextInputStyle.Paragraph),
					);

				const descriptionModal = new ModalBuilder()
					.setCustomId(customId(`${type}_message_description`))
					.setTitle(`${capitalise(type)} Message Description`)
					.setLabelComponents(descriptionInput);

				return interaction.showModal(descriptionModal);
			}
			case 'roles': {
				const rolesSelectMenu = new RoleSelectMenuBuilder()
					.setCustomId(customId('welcome_configuration_roles'))
					.setMinValues(0)
					.setMaxValues(10)
					.setPlaceholder('Choose the roles that new members receive.');

				const rolesRow = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(rolesSelectMenu);

				return interaction.reply({ components: [rolesRow] });
			}
			case 'enabled': {
				return this.welcomeAndFarewellConfigurationToggle({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: `The selected ${type} option could not be found.`,
							member: interaction.member,
						}),
					],
				});
			}
		}
	}

	@DeferUpdate
	private async welcomeAndFarewellConfigurationChannel({ interaction }: Component.Context<'channel'>) {
		const { channels, customId: id, guildId } = interaction;
		const { customId } = extractCustomId(id);
		// biome-ignore lint/style/noNonNullAssertion: It should exist.
		const channel = channels.at(0)!;

		const type = customId.includes('welcome') ? 'welcome' : 'farewell';
		const channelDatabaseValue: InsertWithoutGuildId =
			type === 'welcome' ? { welcomeChannelId: channel.id } : { farewellChannelId: channel.id };

		await database
			.insert(welcomeAndFarewell)
			.values({ guildId, ...channelDatabaseValue })
			.onDuplicateKeyUpdate({
				set: channelDatabaseValue,
			});

		const embed = userEmbed(interaction)
			.setTitle('Updated the Welcome/Farewell Configuration')
			.setDescription(`${interaction.member} updated the ${type} channel to ${channel}`);

		return interaction.editReply({ embeds: [embed], components: [] });
	}

	@DeferReply()
	private async welcomeAndFarewellConfigurationToggle({ interaction }: Component.Context<'string'>) {
		const { farewellEnabled, welcomeEnabled } = welcomeAndFarewell;
		const { guildId } = interaction;
		const { customId: id } = extractCustomId(interaction.id);
		const type = id.includes('welcome_configuration') ? 'welcome' : 'farewell';

		await database
			.insert(welcomeAndFarewell)
			.values({
				guildId,
				...(type === 'welcome'
					? { welcomeEnabled: !welcomeEnabled.default }
					: { farewellEnabled: !farewellEnabled.default }),
			})
			.onDuplicateKeyUpdate({
				set: type === 'welcome' ? { welcomeEnabled: not(welcomeEnabled) } : { farewellEnabled: not(farewellEnabled) },
			});

		const [row] = await database
			.select({
				welcomeEnabled: welcomeAndFarewell.welcomeEnabled,
				farewellEnabled: welcomeAndFarewell.farewellEnabled,
			})
			.from(welcomeAndFarewell)
			.where(eq(welcomeAndFarewell.guildId, interaction.guildId));

		if (!row) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client: interaction.client,
						description: 'No welcome and farewell configuration for the server could be found.',
						member: interaction.member,
					}),
				],
			});
		}

		const valueAsBoolean = type === 'welcome' ? row.welcomeEnabled : row.farewellEnabled;
		const embed = userEmbed(interaction)
			.setTitle('Updated the Welcome/Farewell Configuration')
			.setDescription(
				`${interaction.member} has toggled the ${type} option to ${valueAsBoolean ? 'enabled' : 'disabled'}.`,
			);

		return interaction.editReply({ embeds: [embed] });
	}

	@DeferUpdate
	private async welcomeConfigurationRoles({ interaction }: Component.Context<'role'>) {
		const { guildId } = interaction;
		const welcomeNewMemberRoles = interaction.roles.map((role) => role.id);

		await database
			.insert(welcomeAndFarewell)
			.values({ guildId, welcomeNewMemberRoles })
			.onDuplicateKeyUpdate({ set: { welcomeNewMemberRoles } });

		const roles = welcomeNewMemberRoles.map((id) => roleMention(id)).join(', ');
		const embed = userEmbed(interaction)
			.setTitle('Updated the Welcome Configuration')
			.setDescription(
				`${interaction.member} updated the roles given to new members: ${
					welcomeNewMemberRoles.length > 0 ? roles : 'none'
				}`,
			);

		return interaction.editReply({ embeds: [embed], components: [] });
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [
		customId('welcome_message_title'),
		customId('welcome_message_description'),
		customId('farewell_message_title'),
		customId('farewell_message_description'),
	];

	@DeferReply()
	public async execute({ interaction }: Modal.Context) {
		const { customId } = extractCustomId(interaction.customId);
		const type = customId.includes('welcome') ? 'welcome' : 'farewell';
		const modalType = customId.includes('title')
			? 'title'
			: customId.includes('description')
				? 'description'
				: undefined;

		switch (modalType) {
			case 'title': {
				const { fields, guildId } = interaction;
				const rawTitle = fields.getTextInputValue('message_title');
				const {
					data: title,
					error,
					success,
				} = type === 'welcome'
					? welcomeAndFarewellInsertSchema.shape.welcomeMessageTitle.safeParse(rawTitle)
					: welcomeAndFarewellInsertSchema.shape.farewellMessageTitle.safeParse(rawTitle);

				if (!success) {
					return interaction.editReply({
						embeds: [
							userEmbedError({
								client: interaction.client,
								description: prettifyError(error),
								member: interaction.member,
							}),
						],
					});
				}

				const titleDatabaseValue: InsertWithoutGuildId =
					type === 'welcome' ? { welcomeMessageTitle: title } : { farewellMessageTitle: title };

				await database
					.insert(welcomeAndFarewell)
					.values({ guildId, ...titleDatabaseValue })
					.onDuplicateKeyUpdate({ set: titleDatabaseValue });

				const embed = userEmbed(interaction)
					.setTitle('Updated the Welcome/Farewell Configuration')
					.setDescription(
						`${interaction.member} updated the ${type} message title to` +
							(title ? `:\n\n${inlineCode(title)}` : ' the default title.'),
					);

				return interaction.editReply({ embeds: [embed] });
			}
			case 'description': {
				const { fields, guildId } = interaction;
				const rawDescription = fields.getTextInputValue('message_description');
				const {
					data: description,
					error,
					success,
				} = type === 'welcome'
					? welcomeAndFarewellInsertSchema.shape.welcomeMessageDescription.safeParse(rawDescription)
					: welcomeAndFarewellInsertSchema.shape.farewellMessageDescription.safeParse(rawDescription);

				if (!success) {
					return interaction.editReply({
						embeds: [
							userEmbedError({
								client: interaction.client,
								description: prettifyError(error),
								member: interaction.member,
							}),
						],
					});
				}

				const descriptionDatabaseValue: InsertWithoutGuildId =
					type === 'welcome' ? { welcomeMessageDescription: description } : { farewellMessageDescription: description };

				await database
					.insert(welcomeAndFarewell)
					.values({ guildId, ...descriptionDatabaseValue })
					.onDuplicateKeyUpdate({ set: descriptionDatabaseValue });

				const embed = userEmbed(interaction)
					.setTitle('Updated the Welcome/Farewell Configuration')
					.setDescription(
						`${interaction.member} updated the ${type} message description to` +
							(description ? `:\n\n${inlineCode(description)}` : ' the default description.'),
					);

				return interaction.editReply({ embeds: [embed] });
			}
			default: {
				return interaction.editReply({
					embeds: [
						userEmbedError({
							client: interaction.client,
							description: 'The selected welcome/farewell modal could not be found.',
							member: interaction.member,
						}),
					],
				});
			}
		}
	}
}
