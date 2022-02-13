import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { version } from '../../../package.json';
import type { Command } from '../../types';

const command: Command = {
	privateGuildAndOwnerOnly: true,
	category: 'Utility',
	data: new SlashCommandBuilder()
		.setName('purge-servers')
		.setDescription('Purges servers where bots outnumber the amount of users')
		.addBooleanOption((option) =>
			option.setName('fake').setDescription('Whether to imitate purging servers')
		),
	execute: async ({ client, interaction }) => {
		try {
			await interaction.deferReply({ ephemeral: true });

			const fake = interaction.options.getBoolean('fake');

			// array of arrays: first dimension = shard, second dimension = array of booleans (true = should leave the server)
			const shardGuildBooleanArray = await client.shard!.broadcastEval(
				(c, { ownerGuildId, fake }) =>
					c.guilds.cache.map((guild) => {
						let botCount = 0;
						let userCount = 0;

						guild.members.cache.forEach((member) => (member.user.bot ? botCount++ : userCount++));

						// if there are more than 3 bots per user, leave the guild
						const shouldLeave = userCount / botCount < 1 / 3;

						if (guild.id !== ownerGuildId) {
							if (shouldLeave) {
								if (!fake) {
									guild.leave();
								}
							}
						}

						return shouldLeave;
					}),
				{ context: { ownerGuildId: process.env.DISCORD_GUILD_ID, fake } }
			);

			const shardsServersCount = shardGuildBooleanArray.map((shard) => {
				let purgedServers = 0;
				let leftServers = 0;

				shard.forEach((bool) => (bool ? purgedServers++ : leftServers++));

				return { purgedServers, leftServers };
			});

			let purgedServers = 0;
			let leftServers = 0;

			shardsServersCount.forEach((data) => {
				purgedServers += data.purgedServers;
				leftServers += data.leftServers;
			});

			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle('Purge Servers')
				.addField('Purged Servers', purgedServers.toLocaleString(), true)
				.addField('Servers Left', leftServers.toLocaleString(), true)
				.addField('Amount of Servers Before', (purgedServers + leftServers).toLocaleString(), true)
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			interaction.editReply({
				embeds: [embed]
			});
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
