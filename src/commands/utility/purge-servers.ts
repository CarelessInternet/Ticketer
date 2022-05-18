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
		.addNumberOption((option) =>
			option
				.setName('ratio')
				.setDescription(
					'The amount of bots per user, the recommended amount is 3. Lower is riskier.'
				)
				.setMinValue(1)
		)
		.addBooleanOption((option) =>
			option
				.setName('fake')
				.setDescription('Whether to imitate/fake purging servers. Default is true')
				.setRequired(false)
		),
	execute: async ({ client, interaction }) => {
		try {
			await interaction.deferReply({ ephemeral: true });

			const ratio = interaction.options.getNumber('ratio') ?? 3;
			const fake = interaction.options.getBoolean('fake') ?? true;

			// array of arrays: first dimension = shard, second dimension = array of booleans (true = should leave the server)
			const shardGuildBooleanArray = await client.shard!.broadcastEval(
				(c, { ownerGuildId, fake, ratio }) =>
					c.guilds.cache.map((guild) => {
						const ownerGuild = guild.id === ownerGuildId;

						let botCount = 0;
						let userCount = 0;

						guild.members.cache.forEach((member) => (member.user.bot ? botCount++ : userCount++));

						// if there are more than x bots per user, leave the guild
						const shouldLeave = userCount / botCount < 1 / ratio;

						if (!ownerGuild) {
							if (shouldLeave) {
								if (!fake) {
									guild.leave();
								}
							}
						}

						return !ownerGuild && shouldLeave;
					}),
				{ context: { ownerGuildId: process.env.DISCORD_GUILD_ID, fake, ratio } }
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
				.setTitle(`Purge Servers (${fake ? 'faked' : 'real'})`)
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
