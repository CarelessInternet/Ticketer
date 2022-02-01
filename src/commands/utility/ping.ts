import { inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { type Message, MessageEmbed } from 'discord.js';
import { version } from '../../../package.json';
import { shardStatus } from '../../utils';
import type { Command } from '../../types';

const command: Command = {
	category: 'Utility',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription(
			"Sends a response back with the bot's current average response time"
		),
	execute: async ({ client, interaction }) => {
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true })
			})
			.setTitle('Pinging...')
			.setTimestamp()
			.setFooter({ text: `Version ${version}` });

		try {
			const msg = (await interaction.reply({
				embeds: [embed],
				ephemeral: true,
				fetchReply: true
			})) as Message;
			const time = msg.createdTimestamp - interaction.createdTimestamp;

			embed.setTitle('Result:');
			embed.addField('Ping', `⌛ ${client.ws.ping}ms`, true);
			embed.addField('Latency', `🏓 Roughly ${time}ms`, true);
			embed.addField(
				'Shard Status',
				`⚙️ ${inlineCode(shardStatus(client.ws.status))}`,
				true
			);

			interaction.editReply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
