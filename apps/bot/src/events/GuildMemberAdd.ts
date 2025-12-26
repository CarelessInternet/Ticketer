import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { container, Event } from '@ticketer/djs-framework';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import { fetchChannel, LogExceptions, welcomeContainer } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.GuildMemberAdd;

	@LogExceptions
	public async execute([member]: Event.ArgumentsOf<this['name']>) {
		if (member.id === member.client.user.id) return;

		const { client, id: guildId, members, preferredLocale, roles } = member.guild;
		const [data] = await database.select().from(welcomeAndFarewell).where(eq(welcomeAndFarewell.guildId, guildId));

		if (!data?.welcomeChannelId || !data.welcomeEnabled) return;

		const channel = await fetchChannel(member.guild, data.welcomeChannelId);

		if (!channel?.isTextBased()) return;

		const me = await members.fetchMe();

		if (!channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

		if (data.welcomeNewMemberRoles.length > 0) {
			const highestRoleWithManageRoles = me.roles.cache
				.filter((role) => role.permissions.has([PermissionFlagsBits.ManageRoles]))
				.sort((a, b) => b.position - a.position)
				.at(0);

			if (highestRoleWithManageRoles) {
				const serverRoles = await roles.fetch();
				const notBotRoles = [...serverRoles.filter((role) => !role.tags).values()];
				const commonRoles = notBotRoles.filter((role) => data.welcomeNewMemberRoles.includes(role.id));

				// https://discordjs.dev/docs/packages/discord.js/main/RoleManager:Class#comparePositions
				// You can only add roles that are lower than the highest one (with the manage roles permission) that you have.
				const addableRoles = commonRoles.filter((role) => roles.comparePositions(role, highestRoleWithManageRoles) < 0);

				await member.roles.add(addableRoles);
			}
		}

		const cont = container({
			builder: (cont) =>
				welcomeContainer({
					container: cont,
					data: {
						welcomeMessageTitle: data.welcomeMessageTitle,
						welcomeMessageDescription: data.welcomeMessageDescription,
					},
					locale: preferredLocale,
					member,
				}),
			client,
		});

		void channel.send({ components: [cont], flags: [MessageFlags.IsComponentsV2] });
	}
}
