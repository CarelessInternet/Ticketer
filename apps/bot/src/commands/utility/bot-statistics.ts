/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions */

import { Command, DeferReply } from '@ticketer/djs-framework';
import { PermissionFlagsBits, Status, codeBlock } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { formatDateLong } from '@/utils';

const dataTranslations = translate().commands['bot-statistics'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.bot-statistics.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.bot-statistics.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addBooleanOption((option) =>
			option
				.setName(dataTranslations.options[0].name())
				.setNameLocalizations(getTranslations('commands.bot-statistics.data.options.0.name'))
				.setDescription(dataTranslations.options[0].description())
				.setDescriptionLocalizations(getTranslations('commands.bot-statistics.data.options.0.description'))
				.setRequired(false),
		);
	public readonly ownerOnly = true;
	public readonly guildOnly = true;

	@DeferReply({ name: dataTranslations.options[0].name(), ephemeral: true })
	public async execute({ interaction }: Command.Context<'chat'>) {
		const translations = translate(interaction.locale).commands['bot-statistics'].command;
		const { shard } = interaction.client;

		if (!shard) {
			return interaction.editReply({
				embeds: [super.userEmbedError(interaction.member).setDescription(translations.errors.noShard.description())],
			});
		}

		interface ClientsStats {
			emoji: string;
			value: Promise<number[]>;
		}

		const clientsStats = [
			{
				emoji: '👤',
				value: shard.fetchClientValues('users.cache.size'),
			},
			{
				emoji: '📺',
				value: shard.fetchClientValues('channels.cache.size'),
			},
			{
				emoji: '💻',
				value: shard.broadcastEval((client) =>
					client.guilds.cache.reduce(
						(accumulator, guild) => accumulator + guild.channels.channelCountWithoutThreads,
						0,
					),
				),
			},
			{
				emoji: '💩',
				value: shard.fetchClientValues('emojis.cache.size'),
			},
			{
				emoji: '📊',
				value: shard.fetchClientValues('guilds.cache.size'),
			},
			{
				emoji: '👥',
				value: shard.broadcastEval((client) =>
					client.guilds.cache.reduce((accumulator, guild) => accumulator + guild.memberCount, 0),
				),
			},
		] as ClientsStats[];

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

		const resolvedStats = await Promise.all(clientsStats.map((stat) => stat.value));
		const embed = super.embed
			.setTitle(translations.embeds[0].title())
			.setDescription(translations.embeds[0].description());

		for (let index = 0; index < clientsStats.length; index++) {
			embed.addFields({
				// @ts-expect-error: The index should not go out of bounds.
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				name: `${clientsStats.at(index)!.emoji} ${translations.embeds[0].fields[index]?.()}`,
				value:
					resolvedStats
						.at(index)
						?.reduce((accumulator, value) => accumulator + value, 0)
						.toLocaleString() ?? translations.embeds[0].fallbackFieldValue(),
				inline: true,
			});
		}

		// eslint-disable-next-line unicorn/no-array-reduce
		const shardsStatsAsString = shardsStats.reduce((accumulator, shard, index) => {
			let value = `# ${translations.embeds[0].shardsStats[0]()} ${index.toLocaleString()}\n\n`;
			value += `* ${translations.embeds[0].shardsStats[1]()}: ${shard.ping.toLocaleString()} ms\n`;
			value += `* ${translations.embeds[0].shardsStats[2]()}: ${shard.ramInMegabytes.toString()} MB\n`;
			value += `* ${translations.embeds[0].shardsStats[3]()}: ${shard.servers.toLocaleString()}\n`;
			value += `* ${translations.embeds[0].shardsStats[4]()}: ${Status[shard.status].toString()}\n`;
			value += `* ${translations.embeds[0].shardsStats[5]()}: ${shard.uptime ? formatDateLong(new Date(Date.now() - shard.uptime)) : translations.embeds[0].fallbackFieldValue()}\n`;
			value += `* ${translations.embeds[0].shardsStats[6]()}: ${shard.memberCount.toLocaleString()}\n\n`;

			return accumulator + value;
		}, '');

		embed.addFields({
			name: translations.embeds[0].fields[6](),
			value: codeBlock('markdown', shardsStatsAsString),
		});

		return interaction.editReply({ embeds: [embed] });
	}
}
