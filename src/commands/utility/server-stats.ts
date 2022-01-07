import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { version } from '../../../package.json';
import type { Command } from '../../types';

const command: Command = {
	category: 'Utility',
	data: new SlashCommandBuilder()
		.setName('server-stats')
		.setDescription('Returns stats about the server'),
	execute: ({ interaction }) => {
		try {
			const guild = interaction.guild!;
			const banCount = guild.bans.cache.size;
			const channelCount = guild.channels.channelCountWithoutThreads;
			const emojiCount = guild.emojis.cache.size;
			const roleCount = guild.roles.cache.size;
			const stickerCount = guild.stickers.cache.size;
			const boosts = guild.premiumSubscriptionCount!;
			const { memberCount, name, partnered, verified } = guild;

			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle(`Stats of ${name}`)
				.setDescription('All interesting stats of the server')
				.addField('Member Count', memberCount.toLocaleString(), true)
				.addField('Channel Count', channelCount.toLocaleString(), true)
				.addField('Emoji Count', emojiCount.toLocaleString(), true)
				.addField('Role Count', roleCount.toLocaleString(), true)
				.addField('Sticker Count', stickerCount.toLocaleString(), true)
				.addField('Boost Count', boosts.toLocaleString(), true)
				.addField('Ban Count', banCount.toLocaleString(), true)
				.addField('Verified', verified ? 'True' : 'False', true)
				.addField('Partnered', partnered ? 'True' : 'False', true)
				.setImage(guild.iconURL({ dynamic: true })!)
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			interaction.reply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
