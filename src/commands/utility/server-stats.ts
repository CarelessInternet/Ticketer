import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Command } from '../../types';

export const category: Command['category'] = 'Utility';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('server-stats')
	.setDescription('Returns stats about the server');

export const execute: Command['execute'] = ({ interaction }) => {
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
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
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
			.setTimestamp();

		interaction.reply({ embeds: [embed] });
	} catch (err) {
		console.error(err);
	}
};
