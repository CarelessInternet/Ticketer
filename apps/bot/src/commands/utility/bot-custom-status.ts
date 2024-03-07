import { ActivityType, Locale, PermissionFlagsBits, PresenceUpdateStatus } from 'discord.js';
import { Command, DeferReply } from '@ticketer/djs-framework';
import { getTranslations, translate } from '@/i18n';

const dataTranslations = translate(Locale.EnglishGB).commands['bot-custom-status'].data;

export default class extends Command.Interaction {
	public readonly data = super.SlashBuilder.setName(dataTranslations.name())
		.setNameLocalizations(getTranslations('commands.bot-custom-status.data.name'))
		.setDescription(dataTranslations.description())
		.setDescriptionLocalizations(getTranslations('commands.bot-custom-status.data.description'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) =>
			option
				.setName(dataTranslations.options[0].name())
				.setNameLocalizations(getTranslations('commands.bot-custom-status.data.options.0.name'))
				.setDescription(dataTranslations.options[0].description())
				.setDescriptionLocalizations(getTranslations('commands.bot-custom-status.data.options.0.description'))
				.setRequired(true)
				// According to the maximum limit in the Discord user client.
				.setMaxLength(128),
		)
		.addStringOption((option) =>
			option
				.setName(dataTranslations.options[1].name())
				.setNameLocalizations(getTranslations('commands.bot-custom-status.data.options.1.name'))
				.setDescription(dataTranslations.options[1].description())
				.setDescriptionLocalizations(getTranslations('commands.bot-custom-status.data.options.1.description'))
				.setRequired(false)
				.setChoices(
					...(Object.keys(PresenceUpdateStatus) as (keyof typeof PresenceUpdateStatus)[])
						.filter((name) => name !== 'Offline' && !Number.isInteger(name))
						// @ts-expect-error: The type below is correct.
						.map((name: Exclude<keyof typeof PresenceUpdateStatus, 'Offline'>) => ({
							name: dataTranslations.options[1].choices[name](),
							name_localizations: getTranslations(`commands.bot-custom-status.data.options.1.choices.${name}`),
							value: name,
						})),
				),
		);
	public readonly ownerOnly = true;
	public readonly guildOnly = true;

	@DeferReply({ ephemeral: true })
	public async execute({ interaction }: Command.Context<'chat'>) {
		const customStatus = interaction.options.getString(dataTranslations.options[0].name(), true);
		const displayStatus = interaction.options.getString(dataTranslations.options[1].name(), false);
		const status = (
			displayStatus
				? PresenceUpdateStatus[displayStatus as keyof typeof PresenceUpdateStatus]
				: PresenceUpdateStatus.Online
		) as Exclude<PresenceUpdateStatus, PresenceUpdateStatus.Offline>;

		const translations = translate(interaction.locale).commands['bot-custom-status'].command.embeds[0];
		const replaceShardId = (text: string, id: number) => text.replaceAll('[shardId]', id.toString());
		const { shard } = interaction.client;

		if (!shard) {
			interaction.client.user.setPresence({
				activities: [{ name: replaceShardId(customStatus, 0), type: ActivityType.Custom }],
				status,
			});

			return interaction.editReply({
				embeds: [
					super.userEmbed(interaction.user).setTitle(translations.title()).setDescription(translations.description()),
				],
			});
		}

		await shard.broadcastEval(
			(client, { customStatus, status, type }) => {
				if (!client.isReady() || !client.shard) return;

				const replaceShardId = (text: string, id: number) => text.replaceAll('[shardId]', id.toString());
				client.user.setPresence({
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					activities: [{ name: replaceShardId(customStatus, client.shard.ids.at(0)!), type }],
					status,
				});
			},
			{ context: { customStatus, status, type: ActivityType.Custom } },
		);

		return interaction.editReply({
			embeds: [
				super.userEmbed(interaction.user).setTitle(translations.title()).setDescription(translations.description()),
			],
		});
	}
}
