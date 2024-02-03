import { Command, DeferReply } from '@ticketer/djs-framework';
import { ThreadTicketing, TicketType, UserForums, ticketType } from '@/utils';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate().commands['lock-and-close'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.lock-and-close.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.lock-and-close.data.description'));

	@DeferReply(true)
	public execute(context: Command.Context): unknown {
		switch (ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.lockTicket.call(this, context, true);
			}
			case TicketType.UserForums: {
				return UserForums.lockTicket.call(this, context, true);
			}
			case TicketType.AutomaticThreads: {
				return;
			}
		}
	}
}
