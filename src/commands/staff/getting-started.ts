import { bold, inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { version } from '../../../package.json';
import type { Command } from '../../types';

const command: Command = {
	category: 'Staff',
	data: new SlashCommandBuilder()
		.setName('getting-started')
		.setDescription('Shows how to get started with the bot'),
	execute: ({ interaction }) => {
		if (!interaction.memberPermissions?.has(['MANAGE_GUILD'])) {
			return interaction.reply({
				content: 'You need the manage server permission to run this command',
				ephemeral: true
			});
		}

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true })
			})
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
			)}, or specify a channel via ${inlineCode(
					'ticket-config support-channel'
				)}
			`
			)
			.setTimestamp()
			.setFooter({ text: `Version ${version}` });

		interaction.reply({ embeds: [embed] });
	}
};

export default command;
