import type { RowDataPacket } from 'mysql2';
import { type GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder, userMention, inlineCode, channelMention } from '@discordjs/builders';
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
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('reply-embed')
				.setDescription("Toggle to have the 'suggestion sent' message hidden or not")
		),
	execute: async ({ interaction }) => {
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
				case 'reply-embed': {
					if (!record) {
						return interaction.reply({
							content: 'Please specify a suggestions channel first',
							ephemeral: true
						});
					}

					const opposite = !record.ReplyEmbed;
					await conn.execute('UPDATE Suggestions SET ReplyEmbed = ? WHERE GuildID = ?', [
						opposite,
						interaction.guildId
					]);

					embed.setTitle('Changed Reply Embed Option');
					embed.setDescription(`Changed reply embeds to ${opposite ? 'shown' : 'hidden'}`);

					return interaction.reply({ embeds: [embed] });
				}
				default:
					break;
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
