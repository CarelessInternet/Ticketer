import { AutomaticThreads, ThreadTicketing, TicketType, UserForums, invalidTicket, ticketType } from '@/utils';
import { getTranslations, translate } from '@/i18n';
import { Command } from '@ticketer/djs-framework';

const dataTranslations = translate().commands['rename-title'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.rename-title.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.rename-title.data.description'));

	public async execute(context: Command.Context): Promise<unknown> {
		switch (await ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.renameTitleModal.call(this, context);
			}
			case TicketType.UserForums: {
				return UserForums.renameTitleModal.call(this, context);
			}
			case TicketType.AutomaticThreads: {
				return AutomaticThreads.renameTitleModal.call(this, context, true);
			}
			default: {
				return invalidTicket.call(this, context);
			}
		}
	}
}
