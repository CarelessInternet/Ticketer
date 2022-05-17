import { userMention, SlashCommandBuilder } from '@discordjs/builders';
import {
	type GuildMember,
	type Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed
} from 'discord.js';
import { version } from '../../../package.json';
import type { Command } from '../../types';

const command: Command = {
	category: 'Staff',
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user from the server')
		.addUserOption((option) =>
			option.setName('user').setDescription('The desired user to be banned').setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('days')
				.setDescription('Number of days of messages to delete')
				.setMinValue(0)
				.setMaxValue(7)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('The reason for the ban').setRequired(false)
		),
	execute: async ({ interaction }) => {
		const ephemeral = true;

		try {
			if (!interaction.memberPermissions!.has(['BAN_MEMBERS'])) {
				return interaction.reply({
					content: 'You need the ban members permission to run this command',
					ephemeral
				});
			}
			if (!interaction.guild!.me!.permissions.has(['BAN_MEMBERS'])) {
				return interaction.reply({
					content: 'I need the ban members permission to run this command',
					ephemeral
				});
			}

			const [member, days, reason] = [
				interaction.options.getMember('user') as GuildMember,
				interaction.options.getInteger('days')!,
				interaction.options.getString('reason') ?? ''
			];

			if (member.id === interaction.user.id) {
				return interaction.reply({
					content: 'You cannot ban yourself',
					ephemeral
				});
			}
			if (!member.bannable) {
				return interaction.reply({
					content: 'I am unable to ban this member',
					ephemeral
				});
			}

			const row = new MessageActionRow().addComponents(
				new MessageButton().setCustomId('confirm').setEmoji('✔️').setStyle('SUCCESS'),
				new MessageButton().setCustomId('abort').setEmoji('❌').setStyle('DANGER')
			);
			const embed = new MessageEmbed()
				.setColor('BLURPLE')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle('Ban Confirmation')
				.setDescription(`Are you sure you want to ban ${userMention(member.id)}?`)
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			if (reason) {
				embed.addField('Reason', reason);
			}

			const confirmation = (await interaction.reply({
				embeds: [embed],
				components: [row],
				fetchReply: true
			})) as Message;
			const collector = confirmation.createMessageComponentCollector({
				filter: (i) =>
					(i.customId === 'confirm' || i.customId === 'abort') && i.user.id === interaction.user.id,
				componentType: 'BUTTON',
				time: 15 * 1000
			});

			collector.on('collect', (i) => {
				if (i.customId === 'confirm') {
					member
						.ban({ reason, days })
						.then((user) => {
							embed.setDescription(`👍 ${userMention(user.id)} has been banned from the server`);
							i.update({ embeds: [embed], components: [] });
						})
						.catch(() => {
							embed.setDescription('Failed to ban for an unknown reason');
							i.update({ embeds: [embed], components: [] });
						});
				} else {
					embed.setDescription(`The ban on ${userMention(member.id)} has been aborted`);
					i.update({ embeds: [embed], components: [] });
				}

				collector.stop();
			});
			collector.on('end', (_collected, reason) => {
				switch (reason) {
					case 'time': {
						embed.setDescription(
							`The ban on ${userMention(member.id)} has been aborted due to no response`
						);
						confirmation.edit({ embeds: [embed], components: [] });

						break;
					}
					case 'messageDelete': {
						interaction.channel?.send({
							content: 'Ban aborted because the message was deleted'
						});
						break;
					}
					default:
						break;
				}
			});
		} catch (err) {
			console.error(err);
		}
	}
};

export default command;
