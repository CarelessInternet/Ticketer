import { database, eq, not, welcomeAndFarewell } from '@ticketer/database';
import {
	Component,
	customId,
	DeferReply,
	DeferUpdate,
	extractCustomId,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import {
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	LabelBuilder,
	ModalBuilder,
	RoleSelectMenuBuilder,
	roleMention,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import type { InsertWithoutGuildId } from './helpers';

export default class extends Component.Interaction {
	public readonly customIds = [customId('welcome_configuration'), customId('farewell_configuration')];

	public execute({ interaction }: Component.Context<'string'>) {
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
					.setTitle(`${this.capitalise(type)} Message Title`)
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
					.setTitle(`${this.capitalise(type)} Message Description`)
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

	private capitalise<T extends string>(text: T) {
		text.replace(/./, (character) => character.toUpperCase()) as Capitalize<T>;
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
}

export class Channel extends Component.Interaction {
	public readonly customIds = [customId('welcome_configuration_channel'), customId('farewell_configuration_channel')];

	@DeferUpdate
	public async execute({ interaction }: Component.Context<'channel'>) {
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
}

export class Roles extends Component.Interaction {
	public readonly customIds = [customId('welcome_configuration_roles')];

	@DeferUpdate
	public async execute({ interaction }: Component.Context<'role'>) {
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
