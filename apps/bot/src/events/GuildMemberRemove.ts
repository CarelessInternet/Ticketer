import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { type GuildMember, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { farewellContainer, fetchChannel, LogExceptions } from '@/utils';

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

		const container = super.container((cont) =>
			farewellContainer({
				container: cont,
				data: {
					farewellMessageTitle: data.farewellMessageTitle,
					farewellMessageDescription: data.farewellMessageDescription,
				},
				locale: preferredLocale,
				member: member as GuildMember,
			}),
		);

		void channel.send({ components: [container], flags: [MessageFlags.IsComponentsV2] });
	}
}
