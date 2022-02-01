import type { RowDataPacket } from 'mysql2';
import { MessageEmbed } from 'discord.js';
import { SlashCommandBuilder, channelMention } from '@discordjs/builders';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Suggestions',
	data: new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest an idea, feature, or anything!')
		.addStringOption((option) =>
			option
				.setName('title')
				.setDescription('The title of the suggestion')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('description')
				.setDescription('The message/description of the suggestion')
				.setRequired(true)
		),
	execute: async ({ interaction }) => {
		try {
			const [rows] = await conn.execute(
				'SELECT * FROM Suggestions WHERE GuildID = ?',
				[interaction.guildId]
			);
			const record = (rows as RowDataPacket[])[0] as Tables.Suggestions | null;

			if (!record) {
				return interaction.reply({
					content: 'Missing configuration for suggestions',
					ephemeral: true
				});
			}

			const blockedUsers = (
				typeof record.BlockedUsers === 'string'
					? JSON.parse(record.BlockedUsers as unknown as string)
					: record.BlockedUsers
			) as Tables.Suggestions['BlockedUsers'];

			if (blockedUsers.some((id) => id === interaction.user.id)) {
				return interaction.reply({
					content: 'You are blocked from using suggestions commands',
					ephemeral: true
				});
			}

			const suggestionsChannel = interaction.guild!.channels.resolve(
				record.SuggestionsChannel
			);

			if (!suggestionsChannel) {
				return interaction.reply({
					content: 'Missing the suggestions channel',
					ephemeral: true
				});
			}
			if (suggestionsChannel.isText()) {
				if (
					!suggestionsChannel
						.permissionsFor(interaction.guild!.me!)
						.has(['SEND_MESSAGES', 'ADD_REACTIONS'])
				) {
					return interaction.reply({
						content:
							'I need the send messages and add reactions permission in the suggestions channel',
						ephemeral: true
					});
				}

				const [title, description] = [
					interaction.options.getString('title')!,
					interaction.options.getString('description')!
				];

				const embed = new MessageEmbed()
					.setColor('RANDOM')
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL({ dynamic: true })
					})
					.setTitle(title)
					.setDescription(description)
					.setTimestamp()
					.setFooter({ text: `Version ${version}` });

				const suggestionMessage = await suggestionsChannel.send({
					embeds: [embed]
				});

				suggestionMessage.react('👍');
				suggestionMessage.react('👎');

				const sentEmbed = new MessageEmbed()
					.setColor('DARK_GREEN')
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL({ dynamic: true })
					})
					.setTitle('Suggestion Sent!')
					.setDescription(
						`Your suggestion has been sent! View it at ${channelMention(
							suggestionsChannel.id
						)}`
					)
					.setTimestamp()
					.setFooter({ text: `Version ${version}` });

				interaction.reply({
					embeds: [sentEmbed],
					ephemeral: !record.ReplyEmbed
				});
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
