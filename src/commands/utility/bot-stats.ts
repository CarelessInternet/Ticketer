import { MessageEmbed } from 'discord.js';
import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import { version } from '../../../package.json';
import { shardStatus } from '../../utils';
import type { Command } from '../../types';

const command: Command = {
	privateGuildAndOwnerOnly: true,
	category: 'Utility',
	data: new SlashCommandBuilder()
		.setName('bot-stats')
		.setDescription('Returns stats about the bot')
		.addBooleanOption((option) =>
			option
				.setName('hidden')
				.setDescription('Whether the message should be shown to you or everybody')
				.setRequired(false)
		),
	execute: async ({ interaction }) => {
		try {
			const shardClient = interaction.client.shard!;

			const clientValuesPromises = [
				shardClient.fetchClientValues('guilds.cache.size'),
				shardClient.fetchClientValues('emojis.cache.size'),
				shardClient.fetchClientValues('channels.cache.size'),
				shardClient.fetchClientValues('users.cache.size'),
				shardClient.broadcastEval((c) =>
					c.guilds.cache.reduce((a, b) => a + b.channels.channelCountWithoutThreads, 0)
				),
				shardClient.broadcastEval((c) => c.guilds.cache.reduce((a, b) => a + b.memberCount, 0))
			] as Promise<number[]>[];
			const shardsInfo = await shardClient.broadcastEval((c) => {
				const { ping, status } = c.ws;
				const uptime = c.uptime as number;
				const servers = c.guilds.cache.size;
				const users = c.guilds.cache.reduce((a, b) => a + b.memberCount, 0);

				return { status, ping, uptime, servers, users };
			});

			const [guildSize, emojiSize, channelSize, userSize, channelSizeWithoutThreads, memberSize] =
				await Promise.all(clientValuesPromises);

			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle('Bot Stats')
				.setDescription("Shows info about the bot's stats")
				.addField('📊 Servers', guildSize.reduce((a, b) => a + b, 0).toLocaleString(), true)
				.addField('👥 Server Members', memberSize.reduce((a, b) => a + b, 0).toLocaleString(), true)
				.addField('👤 Cached Users', userSize.reduce((a, b) => a + b, 0).toLocaleString(), true)
				.addField(
					'📺 Channels + Threads',
					channelSize.reduce((a, b) => a + b, 0).toLocaleString(),
					true
				)
				.addField(
					'💻 Channels - Threads',
					channelSizeWithoutThreads.reduce((a, b) => a + b, 0).toLocaleString(),
					true
				)
				.addField('💩 Emojis', emojiSize.reduce((a, b) => a + b, 0).toLocaleString(), true)
				.addField('\u200B', '\u200B')
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			const shardInfoAsString = shardsInfo.reduce((acc, shard, i) => {
				let value = `# Shard ${i.toLocaleString()}\n\n`;
				value += `* Status: ${shardStatus(shard.status)}\n`;
				value += `* Ping: ${shard.ping.toLocaleString()}\n`;
				value += `* Uptime: ${new Date(new Date().getTime() - shard.uptime).toLocaleString()}\n`;
				value += `* Users: ${shard.users.toLocaleString()}\n`;
				value += `* Servers: ${shard.servers.toLocaleString()}\n\n`;

				return acc + value;
			}, '');

			embed.addField('Individual Shards', codeBlock('markdown', shardInfoAsString));

			const ephemeral = interaction.options.getBoolean('hidden') ?? true;

			interaction.reply({ embeds: [embed], ephemeral });
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
