import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { farewellEmbed } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.GuildMemberRemove;

	public async execute([member]: Event.ArgumentsOf<this['name']>) {
		const guildId = BigInt(member.guild.id);
		const table = await database.select().from(welcomeAndFarewell).where(eq(welcomeAndFarewell.guildId, guildId));
		const data = table.at(0);

		if (!data || !data.farewellChannelId || !data.farewellEnabled) {
			return;
		}

		const channel = await member.guild.channels.fetch(data.farewellChannelId.toString());

		if (!channel?.isTextBased()) {
			return;
		}

		const me = await member.guild.members.fetchMe();

		if (!channel.permissionsFor(me).has(PermissionFlagsBits.SendMessages)) {
			return;
		}

		const embed = farewellEmbed({
			data: {
				farewellTitle: data.farewellTitle,
				farewellMessage: data.farewellMessage,
			},
			embed: super.embed,
			locale: member.guild.preferredLocale,
			user: member.user,
		});

		channel.send({ embeds: [embed] });
	}
}
