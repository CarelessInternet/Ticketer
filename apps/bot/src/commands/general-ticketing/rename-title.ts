import { Command } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { AutomaticThreads, invalidTicket, ThreadTicketing, TicketType, ticketType, UserForums } from '@/utils';

const dataTranslations = translate().commands['rename-title'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.rename-title.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.rename-title.data.description'));

	public async execute(context: Command.Context): Promise<unknown> {
		switch (await ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.renameTitleModal(context);
			}
			case TicketType.UserForums: {
				return UserForums.renameTitleModal(context);
			}
			case TicketType.AutomaticThreads: {
				return AutomaticThreads.renameTitleModal(context, true);
			}
			default: {
				return invalidTicket(context);
			}
		}
	}
}
