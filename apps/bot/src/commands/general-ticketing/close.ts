import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { AutomaticThreads, invalidTicket, ThreadTicketing, TicketType, ticketType, UserForums } from '@/utils';

const dataTranslations = translate().commands.close.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.close.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.close.data.description'));

	@DeferReply({ ephemeral: true })
	public async execute(context: Command.Context): Promise<unknown> {
		switch (await ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.closeTicket(context);
			}
			case TicketType.UserForums: {
				return UserForums.closeTicket(context);
			}
			case TicketType.AutomaticThreads: {
				return AutomaticThreads.closeTicket(context, true);
			}
			default: {
				return invalidTicket(context);
			}
		}
	}
}
