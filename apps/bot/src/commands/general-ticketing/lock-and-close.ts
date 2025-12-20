import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { AutomaticThreads, invalidTicket, ThreadTicketing, TicketType, ticketType, UserForums } from '@/utils';

const dataTranslations = translate().commands['lock-and-close'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.lock-and-close.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.lock-and-close.data.description'));

	@DeferReply({ ephemeral: true })
	public async execute(context: Command.Context): Promise<unknown> {
		switch (await ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.lockTicket.call(this, context, true);
			}
			case TicketType.UserForums: {
				return UserForums.lockTicket.call(this, context, true);
			}
			case TicketType.AutomaticThreads: {
				return AutomaticThreads.lockTicket.call(this, context, true, true);
			}
			default: {
				return invalidTicket.call(this, context);
			}
		}
	}
}
