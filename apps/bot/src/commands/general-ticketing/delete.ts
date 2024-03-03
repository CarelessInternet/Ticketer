import { AutomaticThreads, ThreadTicketing, TicketType, UserForums, invalidTicket, ticketType } from '@/utils';
import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';

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
				return ThreadTicketing.deleteTicket.call(this, context);
			}
			case TicketType.UserForums: {
				return UserForums.deleteTicket.call(this, context);
			}
			case TicketType.AutomaticThreads: {
				return AutomaticThreads.deleteTicket.call(this, context, true);
			}
			default: {
				return invalidTicket.call(this, context);
			}
		}
	}
}
