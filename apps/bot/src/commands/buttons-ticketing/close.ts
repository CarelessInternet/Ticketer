import { Command, DeferReply } from '@ticketer/djs-framework';
import { ThreadTicketing, TicketType, UserForums, ticketType } from '@/utils';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate().commands.close.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.close.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.close.data.description'));

	@DeferReply(true)
	public execute(context: Command.Context): unknown {
		switch (ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.closeTicket.call(this, context);
			}
			case TicketType.UserForums: {
				return UserForums.closeTicket.call(this, context);
			}
			case TicketType.AutomaticThreads: {
				return;
			}
		}
	}
}
