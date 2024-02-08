import { AutomaticThreads, ThreadTicketing, TicketType, UserForums, invalidTicket, ticketType } from '@/utils';
import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate().commands.lock.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.lock.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.lock.data.description'));

	@DeferReply(true)
	public async execute(context: Command.Context): Promise<unknown> {
		switch (await ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.lockTicket.call(this, context);
			}
			case TicketType.UserForums: {
				return UserForums.lockTicket.call(this, context);
			}
			case TicketType.AutomaticThreads: {
				return AutomaticThreads.lockTicket.call(this, context, false, true);
			}
			default: {
				return invalidTicket.call(this, context);
			}
		}
	}
}
