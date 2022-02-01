import type { RowDataPacket } from 'mysql2';
import { SlashCommandBuilder } from '@discordjs/builders';
import { conn, handleTicketDelete } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Ticketing',
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription(
			'Deletes the support ticket, messages might be saved if logs are on'
		),
	execute: async ({ interaction }) => {
		try {
			const [rows] = await conn.execute(
				'SELECT * FROM TicketingManagers WHERE GuildID = ?',
				[interaction.guildId]
			);
			const record = (rows as RowDataPacket[])[0] as
				| Tables.TicketingManagers
				| undefined;

			handleTicketDelete(interaction, record);
		} catch (err) {
			console.error(err);
		}
	},
	components: {
		customIds: ['button_ticket_delete'],
		execute: async ({ interaction }) => {
			const [rows] = await conn.execute(
				'SELECT * FROM TicketingManagers WHERE GuildID = ?',
				[interaction.guildId]
			);
			const record = (rows as RowDataPacket[])[0] as
				| Tables.TicketingManagers
				| undefined;

			handleTicketDelete(interaction, record);
		}
	}
};

export default command;
