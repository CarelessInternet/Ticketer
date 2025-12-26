import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { AutomaticThreads, invalidTicket, ThreadTicketing, TicketType, ticketType, UserForums } from '@/utils';

const dataTranslations = translate().commands.lock.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.lock.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.lock.data.description'));

	@DeferReply({ ephemeral: true })
	public async execute(context: Command.Context): Promise<unknown> {
		switch (await ticketType(context.interaction.channel)) {
			case TicketType.ThreadTicketing: {
				return ThreadTicketing.lockTicket(context);
			}
			case TicketType.UserForums: {
				return UserForums.lockTicket(context);
			}
			case TicketType.AutomaticThreads: {
				return AutomaticThreads.lockTicket(context, false, true);
			}
			default: {
				return invalidTicket(context);
			}
		}
	}
}
