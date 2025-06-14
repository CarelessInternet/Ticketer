import { z } from 'zod/v4';

export function extractEmoji(emoji?: string) {
	return z.emoji().safeParse(emoji).data;
}
