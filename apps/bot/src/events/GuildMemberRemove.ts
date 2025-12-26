import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { container, Event } from '@ticketer/djs-framework';
import { type GuildMember, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { farewellContainer, fetchChannel, LogExceptions } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.GuildMemberRemove;

	@LogExceptions
	public async execute([member]: Event.ArgumentsOf<this['name']>) {
		if (member.id === member.client.user.id) return;

		const { client, id: guildId, members, preferredLocale } = member.guild;
		const [data] = await database.select().from(welcomeAndFarewell).where(eq(welcomeAndFarewell.guildId, guildId));

		if (!data?.farewellChannelId || !data.farewellEnabled) return;

		const channel = await fetchChannel(member.guild, data.farewellChannelId);

		if (!channel?.isTextBased()) return;

		const me = await members.fetchMe();

		if (!channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

		const cont = container({
			builder: (cont) =>
				farewellContainer({
					container: cont,
					data: {
						farewellMessageTitle: data.farewellMessageTitle,
						farewellMessageDescription: data.farewellMessageDescription,
					},
					locale: preferredLocale,
					member: member as GuildMember,
				}),
			client,
		});

		void channel.send({ components: [cont], flags: [MessageFlags.IsComponentsV2] });
	}
}
