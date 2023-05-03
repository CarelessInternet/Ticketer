import type { RowDataPacket } from 'mysql2';
import {
	channelMention,
	inlineCode,
	userMention,
	roleMention,
	SlashCommandBuilder
} from '@discordjs/builders';
import {
	MessageActionRow,
	MessageEmbed,
	Modal,
	TextInputComponent,
	type ModalActionRowComponent,
	type Role
} from 'discord.js';
import { ChannelType } from 'discord-api-types/v9';
import { version } from '../../../package.json';
import { conn } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Ticketing',
	data: new SlashCommandBuilder()
		.setName('ticket-config')
		.setDescription('Edit the ticketing configuraton')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('managers')
				.setDescription(
					'Specifies the managers of the tickets. They will automatically get added to each ticket'
				)
				.addRoleOption((option) =>
					option.setName('role').setDescription('The role that manages tickets').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('support-channel')
				.setDescription(
					"Specifies the support channel, this is not required if there is a channel named 'support'"
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel for creating tickets')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('notes')
				.setDescription(
					'Adds another embed which shows additional information inside the ticket message'
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('panel-information')
				.setDescription('Sets the text inside panels for custom information')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('logs-channel')
				.setDescription('Specifies the logs channel, the bot sends a message on ticket activity')
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel for posting logs')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('support-category')
				.setDescription(
					'The category to create text channels under if text-based ticketing is enabled'
				)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel for creating text-based tickets under')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildCategory)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('text-channels')
				.setDescription('Toggle to use either threads or text channels')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('text-channel-ping')
				.setDescription('Toggle to ping the managers when a ticket is created in a text channel')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('private-threads')
				.setDescription('Toggle between using public and private threads')
		)
		.addSubcommand((subcommand) =>
		subcommand
			.setName('notification-channel')
			.setDescription('Specifies the notification channel, the bot sends a message on ticket creation')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('The channel for posting notifications')
					.setRequired(true)
					.addChannelTypes(ChannelType.GuildText)
			)
		),
	execute: async function ({ interaction }) {
		try {
			if (!interaction.memberPermissions?.has(['MANAGE_GUILD'])) {
				return interaction.reply({
					content: 'You need the manage server permission to run this command',
					ephemeral: true
				});
			}

			const [rows] = await conn.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [
				interaction.guildId
			]);
			const record = (rows as RowDataPacket[])[0] as Tables.TicketingManagers | null;

			const embed = new MessageEmbed()
				.setColor('DARK_GREEN')
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true })
				})
				.setTimestamp()
				.setFooter({ text: `Version ${version}` });

			switch (interaction.options.getSubcommand()) {
				case 'managers': {
					const role = interaction.options.getRole('role') as Role;
					if (role.name === '@everyone') {
						return interaction.reply({
							content: 'Role cannot be @ everyone',
							ephemeral: true
						});
					}

					if (!record) {
						await conn.execute('INSERT INTO TicketingManagers (GuildID, RoleID) VALUES (?, ?)', [
							interaction.guildId,
							role.id
						]);
					} else {
						await conn.execute('UPDATE TicketingManagers SET RoleID = ? WHERE GuildID = ?', [
							role.id,
							interaction.guildId
						]);
					}

					embed.setTitle('Changed Managers');

					if (record && record.RoleID !== '0') {
						embed.setDescription(
							`${userMention(interaction.user.id)} changed managers from ${roleMention(
								record.RoleID
							)} to ${roleMention(role.id)}`
						);
					} else {
						embed.setDescription(
							`${userMention(interaction.user.id)} changed managers to ${roleMention(role.id)}`
						);
					}

					return interaction.reply({ embeds: [embed] });
				}
				case 'support-channel': {
					const channel = interaction.options.getChannel('channel')!;

					if (!record) {
						return interaction.reply({
							content: 'You need to create the managers first before editing this config',
							ephemeral: true
						});
					}

					await conn.execute('UPDATE TicketingManagers SET SupportChannel = ? WHERE GuildID = ?', [
						channel.id,
						interaction.guildId
					]);
					embed.setTitle('Changed Support Channel');

					if (record.SupportChannel !== '0') {
						embed.setDescription(
							`${userMention(
								interaction.user.id
							)} changed the support channel from ${channelMention(
								record.SupportChannel
							)} to ${channelMention(channel.id)}`
						);
					} else {
						embed.setDescription(
							`${userMention(interaction.user.id)} changed the support channel to ${channelMention(
								channel.id
							)}`
						);
					}

					return interaction.reply({ embeds: [embed] });
				}
				case 'notes': {
					const description = new MessageActionRow<ModalActionRowComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(this.modals!.customIds[1])
							.setLabel('Description')
							.setPlaceholder('Enter the description of the notes.')
							.setStyle('PARAGRAPH')
							.setMaxLength(2500)
							.setRequired(false)
					);

					const modal = new Modal()
						.setCustomId(this.modals!.customIds[0])
						.setTitle('Notes')
						.addComponents(description);

					return interaction.showModal(modal);
				}
				case 'panel-information': {
					const description = new MessageActionRow<ModalActionRowComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(this.modals!.customIds[3])
							.setLabel('Description')
							.setPlaceholder('Enter the text to be used inside panels.')
							.setStyle('PARAGRAPH')
							.setMaxLength(2500)
							.setRequired(false)
					);

					const modal = new Modal()
						.setCustomId(this.modals!.customIds[2])
						.setTitle('Ticket Panel Information')
						.addComponents(description);

					return interaction.showModal(modal);
				}
				case 'logs-channel': {
					const channel = interaction.options.getChannel('channel')!;

					if (!record) {
						return interaction.reply({
							content: 'You need to create the managers first before editing this config',
							ephemeral: true
						});
					}

					await conn.execute('UPDATE TicketingManagers SET LogsChannel = ? WHERE GuildID = ?', [
						channel.id,
						interaction.guildId
					]);
					embed.setTitle('Changed Logs Channel');

					if (record.LogsChannel !== '0') {
						embed.setDescription(
							`${userMention(interaction.user.id)} changed the logs channel from ${channelMention(
								record.LogsChannel
							)} to ${channelMention(channel.id)}`
						);
					} else {
						embed.setDescription(
							`${userMention(interaction.user.id)} changed the logs channel to ${channelMention(
								channel.id
							)}`
						);
					}

					return interaction.reply({ embeds: [embed] });
				}
				case 'support-category': {
					if (!record) {
						return interaction.reply({
							content: 'You need to create the managers first before editing this config',
							ephemeral: true
						});
					}

					const channel = interaction.options.getChannel('channel')!;
					await conn.execute('UPDATE TicketingManagers SET SupportCategory = ? WHERE GuildID = ?', [
						channel.id,
						interaction.guildId
					]);

					embed.setTitle('Changed Support Category');
					if (record.SupportCategory !== '0') {
						embed.setDescription(
							`${userMention(
								interaction.user.id
							)} changed the support category channel from ${channelMention(
								record.SupportCategory
							)} to ${channelMention(channel.id)}`
						);
					} else {
						embed.setDescription(
							`${userMention(
								interaction.user.id
							)} changed the support category channel to ${channelMention(channel.id)}`
						);
					}

					return interaction.reply({ embeds: [embed] });
				}
				case 'text-channels': {
					if (!record) {
						return interaction.reply({
							content: 'You need to create the managers first before editing this config',
							ephemeral: true
						});
					}

					if (record.SupportCategory === '0') {
						return interaction.reply({
							content: 'Please specify a support category first',
							ephemeral: true
						});
					}

					await conn.execute('UPDATE TicketingManagers SET UseTextChannels = ? WHERE GuildID = ?', [
						!record.UseTextChannels,
						interaction.guildId
					]);

					embed.setTitle('Changed Ticket Channel Type');
					embed.setDescription(
						`${userMention(interaction.user.id)} changed ticket channel type to ${inlineCode(
							!record.UseTextChannels ? 'text channels' : 'threads'
						)}`
					);

					return interaction.reply({ embeds: [embed] });
				}
				case 'text-channel-ping': {
					if (!record) {
						return interaction.reply({
							content: 'You need to create the managers first before editing this config',
							ephemeral: true
						});
					}

					await conn.execute('UPDATE TicketingManagers SET TextChannelPing = ? WHERE GuildID = ?', [
						!record.TextChannelPing,
						interaction.guildId
					]);

					embed.setTitle('Changed Ping for Text Channels');
					embed.setDescription(
						`${userMention(interaction.user.id)} changed text channel pinging to ${inlineCode(
							!record.TextChannelPing ? 'on' : 'off'
						)}`
					);

					return interaction.reply({ embeds: [embed] });
				}
				case 'private-threads': {
					if (!record) {
						return interaction.reply({
							content: 'You need to create the managers first before editing this config',
							ephemeral: true
						});
					}

					await conn.execute('UPDATE TicketingManagers SET PrivateThreads = ? WHERE GuildID = ?', [
						!record.PrivateThreads,
						interaction.guildId
					]);

					embed.setTitle('Changed Visibility for Ticket Threads');
					embed.setDescription(
						`${userMention(
							interaction.user.id
						)} changed the visibility of ticket threads to ${inlineCode(
							!record.PrivateThreads ? 'private' : 'public'
						)}`
					);

					return interaction.reply({ embeds: [embed] });
				}
				case 'notification-channel': {
					const channel = interaction.options.getChannel('channel')!;

					if (!record) {
						return interaction.reply({
							content: 'You need to create the managers first before editing this config',
							ephemeral: true
						});
					}

					await conn.execute('UPDATE TicketingManagers SET NotificationChannel = ? WHERE GuildID = ?', [
						channel.id,
						interaction.guildId
					]);
					embed.setTitle('Changed NotificationChannel Channel');

					if (record.NotificationChannel !== '0') {
						embed.setDescription(
							`${userMention(interaction.user.id)} changed the notification channel from ${channelMention(
								record.LogsChannel
							)} to ${channelMention(channel.id)}`
						);
					} else {
						embed.setDescription(
							`${userMention(interaction.user.id)} changed the notification channel to ${channelMention(
								channel.id
							)}`
						);
					}

					return interaction.reply({ embeds: [embed] });
				}
				default:
					break;
			}
		} catch (err) {
			console.error(err);
		}
	},
	modals: {
		customIds: [
			'modal_ticket-config_notes',
			'modal_ticket-config_notes_description',
			'modal_ticket-config_panel-information',
			'modal_ticket-config_panel-information_description'
		],
		execute: async function ({ interaction }) {
			try {
				const [rows] = await conn.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [
					interaction.guildId
				]);
				const record = (rows as RowDataPacket[])[0] as Tables.TicketingManagers | null;

				if (!record) {
					return interaction.reply({
						content: 'You need to create the managers first before editing this config',
						ephemeral: true
					});
				}

				const embed = new MessageEmbed()
					.setColor('DARK_GREEN')
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL({ dynamic: true })
					})
					.setTimestamp()
					.setFooter({ text: `Version ${version}` });

				switch (interaction.customId) {
					case this.customIds[0]: {
						const description = interaction.fields.getTextInputValue(this.customIds[1]);

						await conn.execute('UPDATE TicketingManagers SET Notes = ? WHERE GuildID = ?', [
							description,
							interaction.guildId
						]);

						embed.setTitle('Updated the Notes');
						embed.setDescription(
							`${userMention(
								interaction.user.id
							)} has updated the notes for tickets. The notes look like the embed below. If there isn't one, the description is empty.`
						);

						const notesEmbed = new MessageEmbed()
							.setColor('BLURPLE')
							.setTitle('Notes')
							.setDescription(description);

						return interaction.reply({ embeds: [embed, ...(description ? [notesEmbed] : [])] });
					}
					case this.customIds[2]: {
						const description = interaction.fields.getTextInputValue(this.customIds[3]);

						await conn.execute(
							'UPDATE TicketingManagers SET PanelInformation = ? WHERE GuildID = ?',
							[description, interaction.guildId]
						);

						embed.setTitle('Updated the Panel');
						embed.setDescription(
							`${userMention(
								interaction.user.id
							)} has updated the ticket panel. The panel looks like the embed below. If there isn't one, the information is empty.`
						);

						const panelEmbed = new MessageEmbed()
							.setColor('RANDOM')
							.setTitle('Panel')
							.setDescription(description);

						return interaction.reply({ embeds: [embed, ...(description ? [panelEmbed] : [])] });
					}
					default:
						break;
				}
			} catch (err) {
				console.error(err);
			}
		}
	}
};

export default command;
