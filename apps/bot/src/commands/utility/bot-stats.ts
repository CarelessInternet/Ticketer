import { PermissionFlagsBits, Status, codeBlock } from 'discord.js';
import { Command } from '@ticketer/djs-framework';
import { formatDate } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('bot-stats')
		.setDescription('Show the statistics of the bot.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addBooleanOption((option) =>
			option
				.setName('hidden')
				.setDescription('Whether the message should be shown to you or everybody.')
				.setRequired(false),
		);
	public readonly ownerOnly = true;
	public readonly guildOnly = true;

	public async execute({ interaction }: Command.Context<'chat'>) {
		const ephemeral = interaction.options.getBoolean('hidden') ?? true;
		const shard = interaction.client.shard;

		if (!shard) {
			return interaction.reply({ content: 'No shard for the bot could be found.' });
		}

		await interaction.deferReply({ ephemeral });

		const clientsStats = [
			shard.fetchClientValues('channels.cache.size'),
			shard.broadcastEval((client) =>
				client.guilds.cache.reduce((accumulator, guild) => accumulator + guild.channels.channelCountWithoutThreads, 0),
			),
			shard.fetchClientValues('emojis.cache.size'),
			shard.fetchClientValues('guilds.cache.size'),
			shard.broadcastEval((client) =>
				client.guilds.cache.reduce((accumulator, guild) => accumulator + guild.memberCount, 0),
			),
			shard.fetchClientValues('users.cache.size'),
		] as Promise<number[]>[];

		const shardsStats = await shard.broadcastEval(async (client) => {
			const ping = client.ws.ping;
			const status = client.ws.status;
			const uptime = client.uptime;
			const servers = client.guilds.cache.size;
			const users = client.guilds.cache.reduce((accumulator, guild) => accumulator + guild.memberCount, 0);

			const { getHeapStatistics } = await import('node:v8');
			const roundToTwoDecimals = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
			const ramInMegabytes = roundToTwoDecimals(getHeapStatistics().total_heap_size / 1024 / 1024);

			return { ping, ramInMegabytes, servers, status, uptime, users };
		});

		const [channelSize, channelSizeWithoutThreads, emojiSize, guildSize, memberSize, userSize] =
			await Promise.all(clientsStats);

		const embed = super
			.userEmbed(interaction.user)
			.setTitle('Bot Stats')
			.setDescription("The data below shows information about the bot's stats.")
			.setFields(
				{
					name: '👤 Cached Users',
					value: userSize?.reduce((accumulator, size) => accumulator + size, 0).toLocaleString() ?? 'Unknown',
					inline: true,
				},
				{
					name: '📺 Channels + Threads',
					value: channelSize?.reduce((accumulator, size) => accumulator + size, 0).toLocaleString() ?? 'Unknown',
					inline: true,
				},
				{
					name: '💻 Channels - Threads',
					value:
						channelSizeWithoutThreads?.reduce((accumulator, size) => accumulator + size, 0).toLocaleString() ??
						'Unknown',
					inline: true,
				},
				{
					name: '💩 Emojis',
					value: emojiSize?.reduce((accumulator, size) => accumulator + size, 0).toLocaleString() ?? 'Unknown',
					inline: true,
				},
				{
					name: '📊 Servers',
					value: guildSize?.reduce((accumulator, size) => accumulator + size, 0).toLocaleString() ?? 'Unknown',
					inline: true,
				},
				{
					name: '👥 Server Members',
					value: memberSize?.reduce((accumulator, size) => accumulator + size, 0).toLocaleString() ?? 'Unknown',
					inline: true,
				},
			);

		// eslint-disable-next-line unicorn/no-array-reduce
		const shardsStatsAsString = shardsStats.reduce((accumulator, shard, index) => {
			let value = `# Shard ${index.toLocaleString()}\n\n`;
			value += `* Ping: ${shard.ping.toLocaleString()} ms\n`;
			value += `* Ram Usage: ${shard.ramInMegabytes} MB\n`;
			value += `* Servers: ${shard.servers.toLocaleString()}\n`;
			value += `* Status: ${Status[shard.status]}\n`;
			value += `* Up Since: ${shard.uptime ? formatDate(new Date(Date.now() - shard.uptime)) : 'Unknown'}\n`;
			value += `* Users: ${shard.users.toLocaleString()}\n\n`;

			return accumulator + value;
		}, '');

		embed.addFields({
			name: 'Individual Shards',
			value: codeBlock('markdown', shardsStatsAsString),
		});

		return interaction.editReply({ embeds: [embed] });
	}
}
