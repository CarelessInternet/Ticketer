import { LogExceptions, farewellEmbed, fetchChannel } from '@/utils';
import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';

export default class extends Event.Handler {
	public readonly name = Event.Name.GuildMemberRemove;

	@LogExceptions
	public async execute([member]: Event.ArgumentsOf<this['name']>) {
		const { id: guildId, members, preferredLocale } = member.guild;
		const [data] = await database.select().from(welcomeAndFarewell).where(eq(welcomeAndFarewell.guildId, guildId));

		if (!data?.farewellChannelId || !data.farewellEnabled) return;

		const channel = await fetchChannel(member.guild, data.farewellChannelId);

		if (!channel?.isTextBased()) return;

		const me = await members.fetchMe();

		if (!channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

		const embed = farewellEmbed({
			data: {
				farewellMessageTitle: data.farewellMessageTitle,
				farewellMessageDescription: data.farewellMessageDescription,
			},
			embed: super.embed,
			locale: preferredLocale,
			user: member.user,
		});

		void channel.send({ embeds: [embed] });
	}
}
