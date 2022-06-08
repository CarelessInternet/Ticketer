import type { RowDataPacket } from 'mysql2';
import {
	MessageActionRow,
	MessageEmbed,
	Modal,
	TextInputComponent,
	type ModalActionRowComponent
} from 'discord.js';
import { SlashCommandBuilder, channelMention } from '@discordjs/builders';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Suggestions',
	data: new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest an idea, feature, or anything!'),
	execute: async function ({ interaction }) {
		try {
			const [rows] = await conn.execute('SELECT * FROM Suggestions WHERE GuildID = ?', [
				interaction.guildId
			]);
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

			const title = new MessageActionRow<ModalActionRowComponent>().addComponents(
				new TextInputComponent()
					.setCustomId(this.modals!.customIds[1])
					.setLabel('Title')
					.setPlaceholder('Enter the title of the suggestion.')
					.setStyle('SHORT')
					.setMaxLength(100)
					.setRequired(true)
			);
			const description = new MessageActionRow<ModalActionRowComponent>().addComponents(
				new TextInputComponent()
					.setCustomId(this.modals!.customIds[2])
					.setLabel('Description')
					.setPlaceholder('Enter the description of the suggestion.')
					.setStyle('PARAGRAPH')
					.setMaxLength(4000)
					.setRequired(true)
			);

			const modal = new Modal()
				.setCustomId(this.modals!.customIds[0])
				.setTitle('Suggestion')
				.addComponents(title, description);

			interaction.showModal(modal);
		} catch (err) {
			console.error(err);
		}
	},
	modals: {
		customIds: ['modal_suggest', 'modal_suggest_title', 'modal_suggest_description'],
		execute: async function ({ interaction }) {
			try {
				const [rows] = await conn.execute('SELECT * FROM Suggestions WHERE GuildID = ?', [
					interaction.guildId
				]);
				const record = (rows as RowDataPacket[])[0] as Tables.Suggestions | null;

				if (!record) {
					return interaction.reply({
						content: 'Missing configuration for suggestions',
						ephemeral: true
					});
				}

				const suggestionsChannel = interaction.guild!.channels.resolve(record.SuggestionsChannel);

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

					const title = interaction.fields.getTextInputValue(this.customIds[1]);
					const description = interaction.fields.getTextInputValue(this.customIds[2]);

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

					await suggestionMessage.react('👍');
					await suggestionMessage.react('👎');

					const sentEmbed = new MessageEmbed()
						.setColor('DARK_GREEN')
						.setAuthor({
							name: interaction.user.tag,
							iconURL: interaction.user.displayAvatarURL({ dynamic: true })
						})
						.setTitle('Suggestion Sent!')
						.setDescription(
							`Your suggestion has been sent! View it at ${channelMention(suggestionsChannel.id)}`
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
	}
};

export default command;
