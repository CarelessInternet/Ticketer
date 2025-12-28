import { and, database, eq, like, ticketThreadsCategories } from '@ticketer/database';
import { Autocomplete } from '@ticketer/djs-framework';

export default class extends Autocomplete.Interaction {
	public readonly name = 'configuration-ticket-threads';

	public async execute({ interaction }: Autocomplete.Context) {
		const { name, value } = interaction.options.getFocused(true);

		if (name === 'title') {
			const categoriesList = await database
				.select({
					id: ticketThreadsCategories.id,
					title: ticketThreadsCategories.categoryTitle,
				})
				.from(ticketThreadsCategories)
				.where(
					and(
						eq(ticketThreadsCategories.guildId, interaction.guildId),
						like(ticketThreadsCategories.categoryTitle, `%${value}%`),
					),
				);

			return interaction.respond(categoriesList.map(({ id, title }) => ({ name: title, value: id.toString() })));
		}
	}
}
