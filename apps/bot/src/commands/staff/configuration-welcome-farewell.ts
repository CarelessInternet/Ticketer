import {
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	ModalBuilder,
	PermissionFlagsBits,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
	channelMention,
	inlineCode,
	roleMention,
} from 'discord.js';
import { Command, Component, DeferReply, DeferUpdate, Modal } from '@ticketer/djs-framework';
import { capitalise, farewellEmbed, welcomeEmbed } from '@/utils';
import { database, eq, not, welcomeAndFarewell } from '@ticketer/database';

type InsertWithoutGuildId = Omit<typeof welcomeAndFarewell.$inferInsert, 'guildId'>;

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
					.setCustomId(super.customId('welcome_configuration'))
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
					.setCustomId(super.customId('farewell_configuration'))
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
				const { guildId, guildLocale, user } = interaction;
				const [result] = await database
					.select()
					.from(welcomeAndFarewell)
					.where(eq(welcomeAndFarewell.guildId, guildId))
					.limit(1);

				if (!result) {
					return interaction.editReply({
						embeds: [super.userEmbedError(user).setDescription('No welcome/farewell configuration could be found.')],
					});
				}

				const generalEmbed = super
					.userEmbed(user)
					.setTitle('General Welcome/Farewell Settings')
					.setDescription(
						'This embed shows the configuration for welcome and farewell messages. The next two embeds show examples of the configured welcome and farewell messages.',
					)
					.setFields(
						{
							name: 'Welcome Channel',
							value: result.welcomeChannelId ? channelMention(result.welcomeChannelId.toString()) : 'None',
							inline: true,
						},
						{
							name: 'Welcome Messages',
							value: result.welcomeEnabled ? 'Enabled' : 'Disabled',
							inline: true,
						},
						{
							name: 'New Member Roles',
							value:
								result.welcomeNewMemberRoles.length > 0
									? result.welcomeNewMemberRoles.map((role) => roleMention(role)).join(', ')
									: 'None',
							inline: true,
						},
						{
							name: '\u200B',
							value: '\u200B',
						},
						{
							name: 'Farewell Channel',
							value: result.farewellChannelId ? channelMention(result.farewellChannelId.toString()) : 'None',
							inline: true,
						},
						{
							name: 'Farewell Messages',
							value: result.farewellEnabled ? 'Enabled' : 'Disabled',
							inline: true,
						},
					);

				const welcomeEmbedExample = welcomeEmbed({
					data: {
						welcomeMessageTitle: result.welcomeMessageTitle,
						welcomeMessageDescription: result.welcomeMessageDescription,
					},
					embed: super.embed,
					locale: guildLocale,
					user,
				});

				const farewellEmbedExample = farewellEmbed({
					data: {
						farewellMessageTitle: result.farewellMessageTitle,
						farewellMessageDescription: result.farewellMessageDescription,
					},
					embed: super.embed,
					locale: guildLocale,
					user,
				});

				return interaction.editReply({ embeds: [generalEmbed, welcomeEmbedExample, farewellEmbedExample] });
			}
			default: {
				return interaction.editReply({
					embeds: [super.userEmbedError(interaction.user).setDescription('The subcommand could not be found.')],
				});
			}
		}
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.customId('welcome_configuration'),
		super.customId('welcome_configuration_channel'),
		super.customId('welcome_configuration_roles'),
		super.customId('farewell_configuration'),
		super.customId('farewell_configuration_channel'),
	];

	public execute({ interaction }: Component.Context) {
		const { customId } = super.extractCustomId(interaction.customId);

		switch (customId) {
			case super.customId('welcome_configuration'):
			case super.customId('farewell_configuration'): {
				return interaction.isStringSelectMenu() && this.welcomeAndFarewellConfiguration({ interaction });
			}
			case super.customId('welcome_configuration_channel'):
			case super.customId('farewell_configuration_channel'): {
				return interaction.isChannelSelectMenu() && this.welcomeAndFarewellConfigurationChannel({ interaction });
			}
			case super.customId('welcome_configuration_roles'): {
				return interaction.isRoleSelectMenu() && this.welcomeConfigurationRoles({ interaction });
			}
			default: {
				return interaction.reply({
					embeds: [super.userEmbedError(interaction.user).setDescription('The select menu ID could not be found.')],
					ephemeral: true,
				});
			}
		}
	}

	private async welcomeAndFarewellConfiguration({ interaction }: Component.Context<'string'>) {
		const { customId } = super.extractCustomId(interaction.customId);
		const type = customId.includes('welcome_configuration') ? 'welcome' : 'farewell';
		const value = interaction.values.at(0);

		switch (value) {
			case 'channel': {
				const channelSelectMenu = new ChannelSelectMenuBuilder()
					.setCustomId(super.customId(`${type}_configuration_channel`))
					.setMinValues(1)
					.setMaxValues(1)
					.setPlaceholder(`Choose a channel for ${type} messages.`)
					.setChannelTypes(ChannelType.GuildText);

				const channelRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(channelSelectMenu);

				return interaction.reply({ components: [channelRow] });
			}
			case 'title': {
				const titleInput = new TextInputBuilder()
					.setCustomId(super.customId('message_title'))
					.setLabel('Message Title')
					.setRequired(false)
					.setMinLength(1)
					.setMaxLength(100)
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Write "{member}" to mention the user in the title.');

				const titleRow = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
				const titleModal = new ModalBuilder()
					.setCustomId(super.customId(`${type}_message_title`))
					.setTitle(`${capitalise(type)} Message Title`)
					.setComponents(titleRow);

				return interaction.showModal(titleModal);
			}
			case 'description': {
				const descriptionInput = new TextInputBuilder()
					.setCustomId(super.customId('message_description'))
					.setLabel('Message Description')
					.setRequired(false)
					.setMinLength(1)
					.setMaxLength(500)
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('Write "{member}" to mention the user in the description.');

				const descriptionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionInput);
				const descriptionModal = new ModalBuilder()
					.setCustomId(super.customId(`${type}_message_description`))
					.setTitle(`${capitalise(type)} Message Description`)
					.setComponents(descriptionRow);

				return interaction.showModal(descriptionModal);
			}
			case 'roles': {
				const rolesSelectMenu = new RoleSelectMenuBuilder()
					.setCustomId(super.customId('welcome_configuration_roles'))
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
						super.userEmbedError(interaction.user).setDescription(`The selected ${type} option could not be found.`),
					],
				});
			}
		}
	}

	@DeferUpdate
	private async welcomeAndFarewellConfigurationChannel({ interaction }: Component.Context<'channel'>) {
		const { channels, customId: id, guildId, user } = interaction;
		const { customId } = super.extractCustomId(id);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

		const embed = super
			.userEmbed(user)
			.setTitle('Updated the Welcome/Farewell Configuration')
			.setDescription(`${user.toString()} updated the ${type} channel to ${channel.toString()}`);

		return interaction.editReply({ embeds: [embed], components: [] });
	}

	@DeferReply()
	private async welcomeAndFarewellConfigurationToggle({ interaction }: Component.Context<'string'>) {
		const { farewellEnabled, welcomeEnabled } = welcomeAndFarewell;
		const { customId: id, guildId, user } = interaction;
		const { customId } = super.extractCustomId(id);
		const type = customId.includes('welcome_configuration') ? 'welcome' : 'farewell';

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

		const embed = super
			.userEmbed(user)
			.setTitle('Updated the Welcome/Farewell Configuration')
			.setDescription(`${user.toString()} has toggled the ${type} enabled option.`);

		return interaction.editReply({ embeds: [embed] });
	}

	@DeferUpdate
	private async welcomeConfigurationRoles({ interaction }: Component.Context<'role'>) {
		const { guildId, user } = interaction;
		const welcomeNewMemberRoles = interaction.roles.map((role) => role.id);

		await database
			.insert(welcomeAndFarewell)
			.values({ guildId, welcomeNewMemberRoles })
			.onDuplicateKeyUpdate({ set: { welcomeNewMemberRoles } });

		const roles = welcomeNewMemberRoles.map((id) => roleMention(id)).join(', ');
		const embed = super
			.userEmbed(user)
			.setTitle('Updated the Welcome Configuration')
			.setDescription(
				`${user.toString()} updated the roles given to new members: ${
					welcomeNewMemberRoles.length > 0 ? roles : 'none'
				}`,
			);

		return interaction.editReply({ embeds: [embed], components: [] });
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [
		super.customId('welcome_message_title'),
		super.customId('welcome_message_description'),
		super.customId('farewell_message_title'),
		super.customId('farewell_message_description'),
	];

	@DeferReply()
	public async execute({ interaction }: Modal.Context) {
		const { customId } = super.extractCustomId(interaction.customId);
		const type = customId.includes('welcome') ? 'welcome' : 'farewell';
		const modalType = customId.includes('title')
			? 'title'
			: customId.includes('description')
				? 'description'
				: undefined;

		switch (modalType) {
			case 'title': {
				const { fields, guildId, user } = interaction;
				const title = fields.getTextInputValue('message_title') || undefined;
				const titleDatabaseValue: InsertWithoutGuildId =
					type === 'welcome' ? { welcomeMessageTitle: title } : { farewellMessageTitle: title };

				await database
					.insert(welcomeAndFarewell)
					.values({ guildId, ...titleDatabaseValue })
					.onDuplicateKeyUpdate({ set: titleDatabaseValue });

				const embed = super
					.userEmbed(user)
					.setTitle('Updated the Welcome/Farewell Configuration')
					.setDescription(
						`${user.toString()} updated the ${type} message title to` +
							(title ? `:\n\n${inlineCode(title)}` : ' the default title.'),
					);

				return interaction.editReply({ embeds: [embed] });
			}
			case 'description': {
				const { fields, guildId, user } = interaction;
				const description = fields.getTextInputValue('message_description') || undefined;
				const descriptionDatabaseValue: InsertWithoutGuildId =
					type === 'welcome' ? { welcomeMessageDescription: description } : { farewellMessageDescription: description };

				await database
					.insert(welcomeAndFarewell)
					.values({ guildId, ...descriptionDatabaseValue })
					.onDuplicateKeyUpdate({ set: descriptionDatabaseValue });

				const embed = super
					.userEmbed(user)
					.setTitle('Updated the Welcome/Farewell Configuration')
					.setDescription(
						`${user.toString()} updated the ${type} message description to` +
							(description ? `:\n\n${inlineCode(description)}` : ' the default description.'),
					);

				return interaction.editReply({ embeds: [embed] });
			}
			default: {
				return interaction.editReply({
					embeds: [
						super
							.userEmbedError(interaction.user)
							.setDescription('The selected welcome/farewell modal could not be found.'),
					],
				});
			}
		}
	}
}
