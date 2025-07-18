import { z } from 'zod';

export function extractEmoji(emoji?: string) {
	return z.emoji().safeParse(emoji).data;
}
