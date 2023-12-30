import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Command, Component, DeferReply, Modal } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';
import { categoryList } from '@/utils';
import { database, eq, ticketThreadsCategories, ticketThreadsConfigurations } from '@ticketer/database';

const dataTranslations = translate('en-GB').commands.ticket.data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.ticket.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.ticket.data.description'));

	@DeferReply(true)
	public async execute({ interaction }: Command.Context) {
		const list = await categoryList(
			super.customId('ticket_threads_categories_create_list'),
			interaction.locale,
			interaction.guildId,
		);

		return interaction.editReply({ components: [list] });
	}
}

export class ComponentInteraction extends Component.Interaction {
	public readonly customIds = [super.customId('ticket_threads_categories_create_list')];

	public execute({ interaction }: Component.Context<'string'>) {
		const translations = translate(interaction.locale).tickets.threads.categories.createModal;
		const id = interaction.values.at(0)!;

		const titleInput = new TextInputBuilder()
			.setCustomId('title')
			.setLabel(translations.title.label())
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(200)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder(translations.title.placeholder());
		const descriptonInput = new TextInputBuilder()
			.setCustomId('description')
			.setLabel(translations.description.label())
			.setRequired(true)
			.setMinLength(1)
			.setMaxLength(2000)
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder(translations.description.placeholder());

		const titleRow = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
		const descriptionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(descriptonInput);

		const modal = new ModalBuilder()
			.setCustomId(super.customId('ticket_threads_categories_create_ticket', id))
			.setTitle(translations.modalTitle())
			.setComponents(titleRow, descriptionRow);

		return interaction.showModal(modal);
	}
}

export class ModalInteraction extends Modal.Interaction {
	public readonly customIds = [super.dynamicCustomId('ticket_threads_categories_create_ticket')];

	@DeferReply(true)
	public async execute({ interaction }: Modal.Context) {
		const { customId, fields, guild, locale, user } = interaction;
		const { dynamicValue } = super.extractCustomId(customId);
		const id = Number.parseInt(dynamicValue!);
		const translations = translate(locale).tickets.threads.categories.createTicket;

		if (Number.isNaN(id)) {
			return interaction.editReply({
				embeds: [
					super
						.userEmbedError(user)
						.setTitle(translations.errors.invalidId.title())
						.setDescription(translations.errors.invalidId.description()),
				],
			});
		}

		// Retrieve the category and global config and check if valid.
		// Check if the user is allowed to create more tickets.
		// Check if the channel exists and is a text channel.
		// ? Check if the manager roles are valid.
		// Check for permissions (Manage Messages, Send Messages in Threads, Create Public/Private Threads).
		// Create the ticket.

		const [configuration] = await database
			.select()
			.from(ticketThreadsCategories)
			.where(eq(ticketThreadsCategories.id, id))
			.innerJoin(ticketThreadsConfigurations, eq(ticketThreadsCategories.guildId, ticketThreadsConfigurations.guildId));
	}
}
