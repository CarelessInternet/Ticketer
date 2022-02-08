import {
	MessageEmbed,
	type NewsChannel,
	type TextChannel,
	type ThreadChannel
} from 'discord.js';
import { inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { version } from '../../../package.json';
import type { Command } from '../../types';

const command: Command = {
	category: 'Staff',
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Removes the latest messages by the requested amount')
		.addIntegerOption((option) =>
			option
				.setName('amount')
				.setDescription('The amount of messages to delete')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100)
		),
	execute: async ({ interaction }) => {
		const ephemeral = true;

		try {
			if (!interaction.memberPermissions!.has(['MANAGE_MESSAGES'])) {
				return interaction.reply({
					content:
						'You need the manage messages permission to run this command',
					ephemeral
				});
			}
			if (!interaction.guild!.me!.permissions.has(['MANAGE_MESSAGES'])) {
				return interaction.reply({
					content: 'I need the manage messages permission to run this command',
					ephemeral
				});
			}

			const amount = interaction.options.getInteger('amount')!;

			const channel = interaction.channel as
				| TextChannel
				| NewsChannel
				| ThreadChannel;
			const deleted = await channel.bulkDelete(amount);

			const embed = new MessageEmbed()
				.setColor('DARK_GREEN')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle('Successfully Deleted Messages')
				.setDescription(
					`Successfully deleted ${inlineCode(
						deleted.size.toString()
					)} messages!`
				)
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			interaction.reply({ embeds: [embed], ephemeral });
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
