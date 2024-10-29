import { Command, Component, DeferReply, DeferUpdate } from '@ticketer/djs-framework';
import { Locale, PermissionFlagsBits } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { goToPage } from '@/utils';
import { viewUserTickets } from './viewUserTickets';

const dataTranslations = translate(Locale.EnglishGB).commands['view-user-tickets'].chat.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.view-user-tickets.chat.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.view-user-tickets.chat.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addUserOption((option) =>
			option
				.setName(dataTranslations.options[0].name())
				.setNameLocalizations(getTranslations('commands.view-user-tickets.chat.data.options.0.name'))
				.setDescription(dataTranslations.options[0].description())
				.setDescriptionLocalizations(getTranslations('commands.view-user-tickets.chat.data.options.0.description'))
				.setRequired(true),
		);

	@DeferReply()
	public execute(context: Command.Context<'chat'>) {
		void viewUserTickets.call(this, context, {
			userId: context.interaction.options.getUser(dataTranslations.options[0].name(), true).id,
		});
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		super.dynamicCustomId('ticket_threads_categories_view_user_previous'),
		super.dynamicCustomId('ticket_threads_categories_view_user_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context) {
		const { success, additionalData, error, page } = goToPage.call(this, context.interaction);

		if (!success) {
			return context.interaction.editReply({
				components: [],
				embeds: [super.userEmbedError(context.interaction.member).setDescription(error)],
			});
		}

		void viewUserTickets.call(this, context, {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			userId: additionalData.at(0)!,
			page,
		});
	}
}
