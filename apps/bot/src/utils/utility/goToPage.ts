import type { BaseInteraction } from '@ticketer/djs-framework';
import type { MessageComponentInteraction } from 'discord.js';
import { z } from 'zod';
import { zodErrorToString } from './zodErrorToString';

interface GoToPageError {
	additionalData?: never;
	error: ReturnType<typeof zodErrorToString>;
	page?: never;
	success: false;
}

interface GoToPageSuccess {
	additionalData: (string | undefined)[];
	error?: never;
	page: number;
	success: true;
}

export function goToPage(
	this: BaseInteraction.Interaction,
	interaction: MessageComponentInteraction,
	goToNextString = 'next',
): GoToPageError | GoToPageSuccess {
	const { customId, dynamicValue } = this.extractCustomId(interaction.customId, true);
	const [pageAsString, ...rest] = dynamicValue.split('_') as [string, string | undefined];
	const { data: currentPage, error, success } = z.coerce.number().int().nonnegative().safeParse(pageAsString);

	if (!success) return { error: zodErrorToString(error), success: false };

	const page = currentPage + (customId.includes(goToNextString) ? 1 : -1);

	return {
		additionalData: rest,
		page,
		success: true,
	};
}
