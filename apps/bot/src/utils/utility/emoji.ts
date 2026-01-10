import type { BaseInteraction } from 'discord.js';

export function extractDiscordEmoji(emoji = '') {
	// RegExp from https://discord.com/channels/222078108977594368/824411059443204127/1338997003014897714
	// Alternative: https://github.com/twitter/twemoji/blob/v12.0.1/2/twemoji.js#L228
	// return /(?:<(?<animated>a)?:(?<name>\w{2,32}):)(?<id>\d{17,21})>|\p{Extended_Pictographic}/gu.exec(emoji)?.at(0);
	return {
		emoji: /^(?:\d{17,21}|\p{Extended_Pictographic}|\p{Emoji_Component})$/u.exec(emoji)?.at(0),
		isSnowflake: /^(?:\d{17,21})$/u.test(emoji),
	};
}

export async function discordEmojiFromId(interaction: BaseInteraction<'cached'>, emojiId = '') {
	// Check if the emoji is in the Client cache.
	const emoji = interaction.client.emojis.resolve(emojiId);

	if (emoji) {
		return { animated: emoji.animated, botInGuild: true, id: emoji.id };
	}

	try {
		// Check if the emoji exists in the guild.
		const { animated, id } = await interaction.guild.emojis.fetch(emojiId);

		return { animated, botInGuild: true, id };
	} catch {
		try {
			// Check if the emoji exists on Discord.
			const request = await fetch(`https://cdn.discordapp.com/emojis/${emojiId}.webp?size=16&animated=true`);

			if (!request.ok) {
				return null;
			}

			return { animated: isWebPAnimated(await request.arrayBuffer()), botInGuild: false, id: emojiId };
		} catch {
			return null;
		}
	}
}

// Code from https://gist.github.com/rtio/b906b3f2ce7ce73ac301a872c4f5ba9f
function isWebPAnimated(buffer: ArrayBuffer) {
	const dataView = new DataView(buffer);
	const signature = dataView.getUint32(0, false);

	// Verify the signature.
	if (signature !== 0x52494646) {
		return false;
	}

	// Get the file size.
	const fileSize = dataView.getUint32(4, true);
	let offset = 12;

	// Find the animated chunk.
	while (offset < fileSize) {
		const chunkType = dataView.getUint32(offset, false);
		const chunkSize = dataView.getUint32(offset + 4, true);

		if (chunkType === 0x414e494d) {
			// Animated chunk.
			return true;
		}

		offset += chunkSize + 8;
	}

	return false;
}
