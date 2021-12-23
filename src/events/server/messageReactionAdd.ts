import { RowDataPacket } from 'mysql2';
import { MessageReaction } from 'discord.js';
import { conn } from '../../utils';
import { Handler, Tables } from '../../types';

export const execute: Handler['execute'] = async (
	client,
	reaction: MessageReaction
) => {
	try {
		const [rows] = await conn.execute(
			'SELECT * FROM Suggestions WHERE GuildID = ?',
			[reaction.message.guildId!]
		);
		const record = (rows as RowDataPacket[])[0] as Tables.Suggestions | null;

		if (!record) return;
		if (record.SuggestionsChannel !== reaction.message.channelId) return;

		if (
			reaction.emoji.name === '👍' &&
			reaction.message.author?.id === client.user!.id
		) {
			if (reaction.count >= record.Target) {
				reaction.message.pin();
			}
		}
	} catch (err) {
		console.error(err);
	}
};
