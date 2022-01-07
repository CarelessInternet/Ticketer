import {
	memberNicknameMention,
	SlashCommandBuilder
} from '@discordjs/builders';
import {
	type GuildMember,
	type Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed
} from 'discord.js';
import { version } from '../../../package.json';
import { Command } from '../../types';

const command: Command = {
	category: 'Staff',
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a user from the server')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The desired user to be kicked')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('reason')
				.setDescription('The reason for the kick')
				.setRequired(false)
		),
	execute: async ({ interaction }) => {
		const ephemeral = true;

		try {
			if (!interaction.memberPermissions!.has(['KICK_MEMBERS'])) {
				return interaction.reply({
					content: 'You need the kick members permission to run this command',
					ephemeral
				});
			}
			if (!interaction.guild!.me!.permissions.has(['KICK_MEMBERS'])) {
				return interaction.reply({
					content: 'I need the kick members permission to run this command',
					ephemeral
				});
			}

			const [user, reason] = [
				interaction.options.getMember('user') as GuildMember,
				interaction.options.getString('reason') ?? ''
			];

			if (user.id === interaction.user.id) {
				return interaction.reply({
					content: 'You may not kick yourself',
					ephemeral: true
				});
			}
			if (!user.kickable) {
				return interaction.reply({
					content: 'I am unable to kick this member',
					ephemeral: true
				});
			}

			const row = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId('confirm')
					.setEmoji('✔️')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('abort')
					.setEmoji('❌')
					.setStyle('DANGER')
			);
			const embed = new MessageEmbed()
				.setColor('BLURPLE')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTitle('Kick Confirmation')
				.setDescription(
					`Are you sure you want to kick ${memberNicknameMention(user.id)}${
						reason ? ' for the following reason: ' + reason : ''
					}?`
				)
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			const confirmation = (await interaction.reply({
				embeds: [embed],
				components: [row],
				fetchReply: true
			})) as Message;
			const collector = confirmation.createMessageComponentCollector({
				filter: (i) =>
					(i.customId === 'confirm' || i.customId === 'abort') &&
					i.user.id === interaction.user.id,
				componentType: 'BUTTON',
				time: 15 * 1000
			});

			collector.on('collect', async (i) => {
				if (i.customId === 'confirm') {
					user
						.kick(reason)
						.then((kickedMember) => {
							embed.setDescription(
								`👍 ${memberNicknameMention(
									kickedMember.id
								)} has been kicked from the server`
							);

							if (reason) {
								embed.addField('Reason', reason);
							}

							i.update({ embeds: [embed], components: [] });
						})
						.catch(() => {
							embed.setDescription(
								`👎 Failed to kick due to an unknown reason`
							);
							i.update({ embeds: [embed], components: [] });
						});
				} else {
					embed.setDescription('Kick has been aborted');
					i.update({ embeds: [embed], components: [] });
				}

				collector.stop();
			});
			collector.on('end', (_collected, reason) => {
				switch (reason) {
					case 'time': {
						embed.setDescription('Kick aborted due to no response');
						confirmation.edit({ embeds: [embed], components: [] });

						break;
					}
					case 'messageDelete': {
						interaction.channel?.send({
							content: 'Kick aborted because the message was deleted'
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
