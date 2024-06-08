import { z } from 'zod';

export function extractEmoji(emoji?: string) {
	return z.string().emoji().safeParse(emoji).data;
}
