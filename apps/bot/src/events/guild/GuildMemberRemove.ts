import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { farewellEmbed } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.GuildMemberRemove;

	public async execute([member]: Event.ArgumentsOf<this['name']>) {
		const { channels, id: guildId, members, preferredLocale } = member.guild;
		const table = await database.select().from(welcomeAndFarewell).where(eq(welcomeAndFarewell.guildId, guildId));
		const data = table.at(0);

		if (!data || !data.farewellChannelId || !data.farewellEnabled) {
			return;
		}

		const channel = await channels.fetch(data.farewellChannelId.toString());

		if (!channel?.isTextBased()) {
			return;
		}

		const me = await members.fetchMe();

		if (!channel.permissionsFor(me).has(PermissionFlagsBits.SendMessages)) {
			return;
		}

		const embed = farewellEmbed({
			data: {
				farewellMessageTitle: data.farewellMessageTitle,
				farewellMessageDescription: data.farewellMessageDescription,
			},
			embed: super.embed,
			locale: preferredLocale,
			user: member.user,
		});

		channel.send({ embeds: [embed] });
	}
}
