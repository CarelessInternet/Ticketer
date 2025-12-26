import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { AutomaticThreads, invalidTicket, ThreadTicketing, TicketType, ticketType, UserForums } from '@/utils';

const dataTranslations = translate().commands.delete.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.delete.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.delete.data.description'));

	@DeferReply({ ephemeral: true })
	public async execute(context: Command.Context): Promise<unknown> {
		switch (await ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.deleteTicket(context);
			}
			case TicketType.UserForums: {
				return UserForums.deleteTicket(context);
			}
			case TicketType.AutomaticThreads: {
				return AutomaticThreads.deleteTicket(context, true);
			}
			default: {
				return invalidTicket(context);
			}
		}
	}
}
