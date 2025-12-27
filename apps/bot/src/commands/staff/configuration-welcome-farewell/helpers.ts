import type { welcomeAndFarewell } from '@ticketer/database';
import { customId } from '@ticketer/djs-framework';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

export type InsertWithoutGuildId = Omit<typeof welcomeAndFarewell.$inferInsert, 'guildId'>;

export function configurationMenu() {
	const welcomeSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(customId('welcome_configuration'))
		.setMinValues(1)
		.setMaxValues(1)
		.setPlaceholder('Edit one of the following welcome options:')
		.setOptions(
			new StringSelectMenuOptionBuilder()
				.setEmoji('#️⃣')
				.setLabel('Channel')
				.setDescription('Change the channel where welcome messages get sent.')
				.setValue('channel'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📘')
				.setLabel('Message Title')
				.setDescription('Change the title used in welcome messages.')
				.setValue('title'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📜')
				.setLabel('Message Description')
				.setDescription('Change the description used in welcome messages.')
				.setValue('description'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('🛡️')
				.setLabel('Roles')
				.setDescription('Give new members specific roles.')
				.setValue('roles'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('🔌')
				.setLabel('Enabled/Disabled')
				.setDescription('Toggle between turning welcome messages on and off.')
				.setValue('enabled'),
		);

	const farewellSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(customId('farewell_configuration'))
		.setMinValues(1)
		.setMaxValues(1)
		.setPlaceholder('Edit one of the following farewell options:')
		.setOptions(
			new StringSelectMenuOptionBuilder()
				.setEmoji('#️⃣')
				.setLabel('Channel')
				.setDescription('Change the channel where farewell messages get sent.')
				.setValue('channel'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📘')
				.setLabel('Message Title')
				.setDescription('Change the title used in farewell messages.')
				.setValue('title'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('📜')
				.setLabel('Message Description')
				.setDescription('Change the description used in farewell messages.')
				.setValue('description'),
			new StringSelectMenuOptionBuilder()
				.setEmoji('🔌')
				.setLabel('Enabled/Disabled')
				.setDescription('Toggle between turning farewell messages on and off.')
				.setValue('enabled'),
		);

	const welcomeRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(welcomeSelectMenu);
	const farewellRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(farewellSelectMenu);

	return [welcomeRow, farewellRow];
}
