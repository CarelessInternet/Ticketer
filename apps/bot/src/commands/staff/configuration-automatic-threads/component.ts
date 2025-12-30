import {
	and,
	automaticThreadsConfigurations,
	automaticThreadsConfigurationsSelectSchema,
	database,
	eq,
} from '@ticketer/database';
import {
	Component,
	customId,
	DeferUpdate,
	dynamicCustomId,
	extractCustomId,
	userEmbed,
	userEmbedError,
} from '@ticketer/djs-framework';
import { ActionRowBuilder, channelMention, MessageFlags, RoleSelectMenuBuilder, roleMention } from 'discord.js';
import { prettifyError } from 'zod';
import { goToPage } from '@/utils';
import { configurationMenu, getConfigurations, openingMessageModal } from './helpers';

export default class extends Component.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_automatic_threads_configuration_menu')];

	public execute(context: Component.Context<'string'>) {
		switch (context.interaction.values.at(0)) {
			case 'message_title_description': {
				return this.openingMessage(context);
			}
			case 'managers': {
				const { dynamicValue } = extractCustomId(context.interaction.customId, true);
				const managersMenu = new RoleSelectMenuBuilder()
					.setCustomId(customId('ticket_automatic_threads_configuration_managers', dynamicValue))
					.setMinValues(0)
					.setMaxValues(10)
					.setPlaceholder('Choose the managers of the automatic threads.');

				const row = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(managersMenu);

				return context.interaction.update({ components: [row] });
			}
			default: {
				return context.interaction.reply({
					embeds: [
						userEmbedError({
							client: context.interaction.client,
							description: 'The selected value could not be found.',
							member: context.interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				});
			}
		}
	}

	private async openingMessage(context: Component.Context<'string'>) {
		const { dynamicValue } = extractCustomId(context.interaction.customId, true);
		const {
			data: channelId,
			error,
			success,
		} = automaticThreadsConfigurationsSelectSchema.shape.channelId.safeParse(dynamicValue);

		if (!success) {
			return context.interaction
				.reply({
					embeds: [
						userEmbedError({
							client: context.interaction.client,
							description: prettifyError(error),
							member: context.interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		const [row] = await database
			.select({
				title: automaticThreadsConfigurations.openingMessageTitle,
				description: automaticThreadsConfigurations.openingMessageDescription,
			})
			.from(automaticThreadsConfigurations)
			.where(
				and(
					eq(automaticThreadsConfigurations.channelId, channelId),
					eq(automaticThreadsConfigurations.guildId, context.interaction.guildId),
				),
			);

		if (!row) {
			return context.interaction
				.reply({
					embeds: [
						userEmbedError({
							client: context.interaction.client,
							description: 'No automatic threads configuration for the channel could be found.',
							member: context.interaction.member,
						}),
					],
					flags: [MessageFlags.Ephemeral],
				})
				.catch(() => false);
		}

		void openingMessageModal(context, { channelId, ...row });
	}
}

export class Managers extends Component.Interaction {
	public readonly customIds = [dynamicCustomId('ticket_automatic_threads_configuration_managers')];

	@DeferUpdate
	public async execute({ interaction }: Component.Context<'role'>) {
		const { dynamicValue } = extractCustomId(interaction.customId, true);
		const managers = interaction.roles.map((role) => role.id);
		const {
			data: channelId,
			error,
			success,
		} = automaticThreadsConfigurationsSelectSchema.shape.channelId.safeParse(dynamicValue);

		if (!success) {
			return interaction.editReply({
				components: [],
				embeds: [
					userEmbedError({ client: interaction.client, description: prettifyError(error), member: interaction.member }),
				],
			});
		}

		await database
			.update(automaticThreadsConfigurations)
			.set({ managers })
			.where(
				and(
					eq(automaticThreadsConfigurations.channelId, channelId),
					eq(automaticThreadsConfigurations.guildId, interaction.guildId),
				),
			);

		const roles = managers.map((id) => roleMention(id)).join(', ');
		const embed = userEmbed(interaction)
			.setTitle('Updated the Automatic Threads Managers')
			.setDescription(
				`${interaction.member} updated the managers of the automatic threads in ${channelMention(channelId)} to: ${
					managers.length > 0 ? roles : 'none'
				}.`,
			);

		interaction.editReply({ components: [], content: '', embeds: [embed] });
		return interaction.followUp({ components: configurationMenu(channelId) });
	}
}

export class Overview extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('ticket_automatic_threads_view_previous'),
		dynamicCustomId('ticket_automatic_threads_view_next'),
	];

	@DeferUpdate
	public execute(context: Component.Context<'button'>) {
		const { success, error, page } = goToPage(context.interaction);

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

		void getConfigurations(context, page);
	}
}
