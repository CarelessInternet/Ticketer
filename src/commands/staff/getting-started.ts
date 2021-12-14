import { bold, inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { version } from '../../../package.json';
import { Command } from '../../types';

export const category: Command['category'] = 'Staff';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('getting-started')
	.setDescription('Shows how to get started with the bot');

export const execute: Command['execute'] = ({ interaction }) => {
	if (!interaction.memberPermissions?.has(['MANAGE_GUILD'])) {
		return interaction.reply({
			content: 'You need the manage server permission to run this command',
			ephemeral: true
		});
	}

	const embed = new MessageEmbed()
		.setColor('RANDOM')
		.setAuthor(
			interaction.user.tag,
			interaction.user.displayAvatarURL({ dynamic: true })
		)
		.setTitle('Getting Started')
		// nice formatting prettier lol
		.setDescription(
			`
      ${bold(
				'DISCLAIMER:'
			)} Don't change the name of support tickets, the bot won't be able to close the ticket properly

    1. Give the bot all thread permissions and manage messages
    2. Add the managers via ${inlineCode('ticket-config managers')}
    3. Create a text channel named ${inlineCode(
			'support'
		)}, or specify a channel via ${inlineCode('ticket-config support-channel')}
    `
		)
		.setTimestamp()
		.setFooter(`Version ${version}`);

	interaction.reply({ embeds: [embed] });
};
