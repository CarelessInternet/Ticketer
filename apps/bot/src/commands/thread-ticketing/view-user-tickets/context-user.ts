import { Command, DeferReply } from '@ticketer/djs-framework';
import { Locale, PermissionFlagsBits } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { viewUserTickets } from './viewUserTickets';

const dataTranslations = translate(Locale.EnglishGB).commands['view-user-tickets']['context-user'].data;

export default class extends Command.Interaction {
	public readonly data = super.ContextUserBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.view-user-tickets.context-user.data.name'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads);

	@DeferReply({ ephemeral: true })
	public execute(context: Command.Context<'user'>) {
		void viewUserTickets.call(this, context, { userId: context.interaction.targetUser.id });
	}
}
