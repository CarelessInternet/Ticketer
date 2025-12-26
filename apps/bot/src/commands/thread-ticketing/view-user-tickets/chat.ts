import { Command, Component, DeferReply, DeferUpdate, dynamicCustomId, userEmbedError } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { getTranslations, translate } from '@/i18n';
import { goToPage } from '@/utils';
import { viewUserTickets } from './viewUserTickets';

const dataTranslations = translate().commands['view-user-tickets'].chat.data;

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
		void viewUserTickets(context, {
			userId: context.interaction.options.getUser(dataTranslations.options[0].name(), true).id,
		});
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_threads_categories_view_user_previous'),
		dynamicCustomId('ticket_threads_categories_view_user_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context) {
		const { success, additionalData, error, page } = goToPage(context.interaction);

		if (!success) {
			return context.interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({
						client: context.interaction.client,
						description: error,
						member: context.interaction.member,
					}),
				],
			});
		}

		void viewUserTickets(context, {
			// biome-ignore lint/style/noNonNullAssertion: It should exist.
			userId: additionalData.at(0)!,
			page,
		});
	}
}
