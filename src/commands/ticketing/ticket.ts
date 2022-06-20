import type { RowDataPacket } from 'mysql2';
import {
	MessageActionRow,
	Modal,
	TextInputComponent,
	type ModalActionRowComponent
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import type { Command, Tables } from '../../types';
import { conn, handleTicketCreation } from '../../utils';

const command: Command = {
	category: 'Ticketing',
	data: new SlashCommandBuilder().setName('ticket').setDescription('Create a support ticket'),
	execute: async function ({ interaction }) {
		try {
			if (!interaction.channel!.isText()) {
				return interaction.reply({
					content: 'You must use this command in a valid text channel',
					ephemeral: true
				});
			}

			const subject = new MessageActionRow<ModalActionRowComponent>().addComponents(
				new TextInputComponent()
					.setCustomId(this.modals!.customIds[1])
					.setLabel('Subject')
					.setPlaceholder('Enter the description of the support ticket.')
					.setStyle('PARAGRAPH')
					.setMaxLength(300)
					.setRequired(true)
			);

			const modal = new Modal()
				.setCustomId(this.modals!.customIds[0])
				.setTitle('Support Ticket')
				.addComponents(subject);

			interaction.showModal(modal);
		} catch (err) {
			console.error(err);
		}
	},
	modals: {
		customIds: ['modal_ticket', 'modal_ticket_subject'],
		execute: async function ({ interaction }) {
			try {
				const [rows] = await conn.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [
					interaction.guildId
				]);
				const record = (rows as RowDataPacket[])[0] as Tables.TicketingManagers | null;

				if (!record) {
					return interaction.reply({
						content: 'I am missing the config for tickets',
						ephemeral: true
					});
				}
				if (record.RoleID === '0') {
					return interaction.reply({
						content: 'Missing the managers, please add them via ticket-config',
						ephemeral: true
					});
				}

				const subject = interaction.fields.getTextInputValue(this.customIds[1]);
				const managers = await interaction.guild!.roles.fetch(record.RoleID);

				if (!managers) {
					return interaction.reply({
						content: 'No manager role could be found',
						ephemeral: true
					});
				}

				handleTicketCreation(interaction, managers, record, subject);
			} catch (err) {
				console.error(err);
			}
		}
	}
};

export default command;
