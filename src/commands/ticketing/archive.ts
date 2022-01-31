import type { RowDataPacket } from 'mysql2';
import { SlashCommandBuilder } from '@discordjs/builders';
import { conn, handleTicketArchive } from '../../utils';
import type { Command, Tables } from '../../types';

const command: Command = {
	category: 'Ticketing',
	data: new SlashCommandBuilder()
		.setName('archive')
		.setDescription('Archives the support ticket'),
	execute: async ({ interaction }) => {
		try {
			if (!interaction.channel!.isThread()) {
				return interaction.reply({
					content:
						'You can only use this command in a support ticket which uses threads',
					ephemeral: true
				});
			}

			const [rows] = await conn.execute(
				'SELECT * FROM TicketingManagers WHERE GuildID = ?',
				[interaction.guildId]
			);
			const record = (rows as RowDataPacket[])[0] as
				| Tables.TicketingManagers
				| undefined;

			handleTicketArchive(interaction, record);
		} catch (err) {
			console.error(err);
		}
	},
	components: {
		customIds: ['button_ticket_archive'],
		execute: async ({ interaction }) => {
			const [rows] = await conn.execute(
				'SELECT * FROM TicketingManagers WHERE GuildID = ?',
				[interaction.guildId]
			);
			const record = (rows as RowDataPacket[])[0] as
				| Tables.TicketingManagers
				| undefined;

			handleTicketArchive(interaction, record);
		}
	}
};

export default command;
