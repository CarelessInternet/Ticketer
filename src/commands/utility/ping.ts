import { inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { shardStatus } from '../../utils';
import { Command } from '../../types';

export const category: Command['category'] = 'Utility';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('ping')
	.setDescription(
		"Sends a response back with the bot's current average response time"
	);

export const execute: Command['execute'] = async ({ client, interaction }) => {
	const embed = new MessageEmbed()
		.setColor('RANDOM')
		.setAuthor(
			interaction.user.tag,
			interaction.user.displayAvatarURL({ dynamic: true })
		)
		.setTitle('Pinging...')
		.setTimestamp();

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
};
