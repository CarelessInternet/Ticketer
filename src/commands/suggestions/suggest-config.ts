import type { RowDataPacket } from 'mysql2';
import {
	MessageEmbed,
	MessageActionRow,
	type ModalActionRowComponent,
	TextInputComponent,
	Modal
} from 'discord.js';
import { SlashCommandBuilder, inlineCode, channelMention, userMention } from '@discordjs/builders';
import { ChannelType } from 'discord-api-types/v9';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Suggestions',
	data: new SlashCommandBuilder()
		.setName('suggest-config')
		.setDescription('Edit configuration for suggestions')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('suggestions-channel')
				.setDescription('The channel where all the suggestions lies')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel for suggestions')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('panel-information')
				.setDescription('Sets the text inside the panel for custom information')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('target')
				.setDescription('The amount of upvotes to reach to get pinned in the channel')
				.addIntegerOption((option) =>
					option
						.setName('amount')
						.setDescription('The amount of upvotes')
						.setRequired(true)
						.setMinValue(0)
						.setMaxValue(32_767)
				)
		),
	execute: async function ({ interaction }) {
		try {
			if (!interaction.memberPermissions?.has(['MANAGE_CHANNELS'])) {
				return interaction.reply({
					content: 'You need the manage channels permission to run these commands',
					ephemeral: true
				});
			}

			const [rows] = await conn.execute('SELECT * FROM Suggestions WHERE GuildID = ?', [
				interaction.guildId
			]);
			const record = (rows as RowDataPacket[])[0] as Tables.Suggestions | null;

			const embed = new MessageEmbed()
				.setColor('DARK_GREEN')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			switch (interaction.options.getSubcommand()) {
				case 'suggestions-channel': {
					const channel = interaction.options.getChannel('channel')!;

					if (!record) {
						await conn.execute(
							'INSERT INTO Suggestions (GuildID, SuggestionsChannel) VALUES (?, ?)',
							[interaction.guildId, channel.id]
						);
					} else {
						await conn.execute('UPDATE Suggestions SET SuggestionsChannel = ? WHERE GuildID = ?', [
							channel.id,
							interaction.guildId
						]);
					}

					embed.setTitle('Changed Suggestions Channel');
					embed.setDescription(
						`The suggestions channel has been updated to ${channelMention(channel.id)}`
					);

					return interaction.reply({ embeds: [embed] });
				}
				case 'panel-information': {
					const description = new MessageActionRow<ModalActionRowComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(this.modals!.customIds[1])
							.setLabel('Description')
							.setPlaceholder('Enter the text to be used inside panels.')
							.setStyle('PARAGRAPH')
							.setMaxLength(2500)
							.setRequired(false)
					);

					const modal = new Modal()
						.setCustomId(this.modals!.customIds[0])
						.setTitle('Suggestion Panel Information')
						.addComponents(description);

					return interaction.showModal(modal);
				}
				case 'target': {
					if (!record) {
						return interaction.reply({
							content: 'Please specify a suggestions channel first',
							ephemeral: true
						});
					}

					const target = interaction.options.getInteger('amount')!;

					await conn.execute(
						'UPDATE Suggestions SET Target = ? WHERE GuildID = ?',
						// TODO: bug: can't update int field where other field is of bigint type
						// temp fix: convert int field value to string before executing
						// https://github.com/sidorares/node-mysql2/issues/1483
						[target.toString(), interaction.guildId]
					);
					embed.setTitle('Updated Suggestions Target Value');
					embed.setDescription(
						`The amount of upvotes required to be pinned has been updated to ${inlineCode(
							target.toLocaleString()
						)}`
					);

					return interaction.reply({ embeds: [embed] });
				}
				default:
					break;
			}
		} catch (err) {
			console.error(err);
		}
	},
	modals: {
		customIds: [
			'modal_suggest-config_panel-information',
			'modal_suggest-config_panel-information_description'
		],
		execute: async function ({ interaction }) {
			const [rows] = await conn.execute('SELECT * FROM Suggestions WHERE GuildID = ?', [
				interaction.guildId
			]);
			const record = (rows as RowDataPacket[])[0] as Tables.Suggestions | null;

			if (!record) {
				return interaction.reply({
					content: 'You need to specify the suggestions channel first',
					ephemeral: true
				});
			}

			const description = interaction.fields.getTextInputValue(this.customIds[1]);

			await conn.execute('UPDATE Suggestions SET PanelInformation = ? WHERE GuildID = ?', [
				description,
				interaction.guildId
			]);

			const embed = new MessageEmbed()
				.setColor('DARK_GREEN')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle('Updated the Panel')

				.setDescription(
					`${userMention(
						interaction.user.id
					)} has updated the suggestions panel. The panel looks like the embed below. If there isn't one, the information is empty.`
				)
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			const panelEmbed = new MessageEmbed()
				.setColor('RANDOM')
				.setTitle('Panel')
				.setDescription(description);

			return interaction.reply({ embeds: [embed, ...(description ? [panelEmbed] : [])] });
		}
	}
};

export default command;
