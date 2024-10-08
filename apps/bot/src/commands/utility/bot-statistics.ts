import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits, Status, codeBlock } from 'discord.js';
import { formatDateLong } from '@/utils';

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName('bot-statistics')
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

	@DeferReply({ name: 'hidden', ephemeral: true })
	public async execute({ interaction }: Command.Context<'chat'>) {
		const { shard } = interaction.client;

		if (!shard) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription('No shard for the bot could be found.')],
			});
		}

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
			const memberCount = client.guilds.cache.reduce((accumulator, guild) => accumulator + guild.memberCount, 0);

			const { getHeapStatistics } = await import('node:v8');
			const heapSize = getHeapStatistics().total_heap_size / 1024 / 1024;
			const ramInMegabytes = Math.round((heapSize + Number.EPSILON) * 100) / 100;

			return { memberCount, ping, ramInMegabytes, servers, status, uptime };
		});

		const [channelSize, channelSizeWithoutThreads, emojiSize, guildSize, memberSize, userSize] =
			await Promise.all(clientsStats);

		const embed = super.embed
			.setTitle('Bot Statistics')
			.setDescription("The data below shows information about the bot's statistics.")
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
			value += `* RAM Usage: ${shard.ramInMegabytes.toString()} MB\n`;
			value += `* Servers: ${shard.servers.toLocaleString()}\n`;
			value += `* Status: ${Status[shard.status].toString()}\n`;
			value += `* Up Since: ${shard.uptime ? formatDateLong(new Date(Date.now() - shard.uptime)) : 'Unknown'}\n`;
			value += `* Member Count: ${shard.memberCount.toLocaleString()}\n\n`;

			return accumulator + value;
		}, '');

		embed.addFields({
			name: 'Individual Shards',
			value: codeBlock('markdown', shardsStatsAsString),
		});

		return interaction.editReply({ embeds: [embed] });
	}
}
