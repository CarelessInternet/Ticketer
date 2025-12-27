import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { container, DeferReply, Subcommand, userEmbedError } from '@ticketer/djs-framework';
import {
	bold,
	channelMention,
	HeadingLevel,
	heading,
	MessageFlags,
	roleMention,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
} from 'discord.js';
import { farewellContainer, welcomeContainer } from '@/utils';
import { configurationMenu } from './helpers';

export default class extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-welcome-farewell',
		subcommandName: 'settings',
	});

	public execute({ interaction }: Subcommand.Context) {
		return interaction.reply({ components: configurationMenu() });
	}
}

export class Overview extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: 'configuration-welcome-farewell',
		subcommandName: 'overview',
	});

	@DeferReply()
	public async execute({ interaction }: Subcommand.Context) {
		const { client, guildId, guildLocale, member } = interaction;
		const [result] = await database
			.select()
			.from(welcomeAndFarewell)
			.where(eq(welcomeAndFarewell.guildId, guildId))
			.limit(1);

		if (!result) {
			return interaction.editReply({
				embeds: [
					userEmbedError({
						client,
						description: 'No welcome/farewell configuration could be found.',
						member,
					}),
				],
			});
		}

		const welcome = container({
			builder: (cont) =>
				welcomeContainer({
					container: cont
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								heading(`Welcome Messages: ${result.welcomeEnabled ? 'Enabled' : 'Disabled'}`, HeadingLevel.One),
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Welcome Channel')}: ${result.welcomeChannelId ? channelMention(result.welcomeChannelId) : 'None'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('New Member Roles')}: ${
									result.welcomeNewMemberRoles.length > 0
										? result.welcomeNewMemberRoles.map((role) => roleMention(role)).join(', ')
										: 'None'
								}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)),
						)
						.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
					data: {
						welcomeMessageTitle: result.welcomeMessageTitle,
						welcomeMessageDescription: result.welcomeMessageDescription,
					},
					locale: guildLocale,
					member,
				}),
			client,
		});

		const farewell = container({
			builder: (cont) =>
				farewellContainer({
					container: cont
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								heading(`Farewell Messages: ${result.farewellEnabled ? 'Enabled' : 'Disabled'}`, HeadingLevel.One),
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`${bold('Farewell Channel')}: ${result.farewellChannelId ? channelMention(result.farewellChannelId) : 'None'}`,
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(heading('Message Preview:', HeadingLevel.Two)),
						)
						.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)),
					data: {
						farewellMessageTitle: result.farewellMessageTitle,
						farewellMessageDescription: result.farewellMessageDescription,
					},
					locale: guildLocale,
					member,
				}),
			client,
		});

		return interaction.editReply({ components: [welcome, farewell], flags: [MessageFlags.IsComponentsV2] });
	}
}
