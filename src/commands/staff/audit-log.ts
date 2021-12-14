import {
	inlineCode,
	memberNicknameMention,
	SlashCommandBuilder,
	time
} from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Command } from '../../types';

export const category: Command['category'] = 'Staff';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('audit-log')
	.setDescription('Displays the audit log');

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (!interaction.memberPermissions!.has(['VIEW_AUDIT_LOG'])) {
			return interaction.reply({
				content: 'You need the view audit log permission to run this command',
				ephemeral: true
			});
		}
		if (!interaction.guild!.me!.permissions.has(['VIEW_AUDIT_LOG'])) {
			return interaction.reply({
				content: 'I need the view audit log permission to run this command',
				ephemeral: true
			});
		}

		const { entries } = await interaction.guild!.fetchAuditLogs({ limit: 15 });
		const changes = entries.map((log) => {
			const { createdAt, executor } = log;
			const action = inlineCode(log.action);
			const user = executor ? memberNicknameMention(executor.id) : 'Unknown';
			const timestamp = time(createdAt, 'R');

			return `${user}: ${action} ${timestamp}`;
		});

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
			.setTitle('Audit Log')
			.setDescription('List of changes saved in audit log')
			.addField('Changes', changes.join('\n'))
			.setTimestamp();

		interaction.reply({ embeds: [embed] });
	} catch (err) {
		console.error(err);
	}
};
