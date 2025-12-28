import { Component, DeferUpdate, dynamicCustomId, userEmbedError } from '@ticketer/djs-framework';
import { translate } from '@/i18n';
import { goToPage } from '@/utils';
import { getBlacklists } from './helpers';

export default class extends Component.Interaction {
	public readonly customIds = [
		dynamicCustomId('guild_blacklist_view_previous'),
		dynamicCustomId('guild_blacklist_view_next'),
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
						title: translate(context.interaction.locale).commands[
							'guild-blacklist'
						].command.errors.invalidFields.title(),
					}),
				],
			});
		}

		void getBlacklists(context, page);
	}
}
