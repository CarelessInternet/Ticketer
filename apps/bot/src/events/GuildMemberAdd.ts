import { LogExceptions, fetchChannel, welcomeContainer } from '@/utils';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';

export default class extends Event.Handler {
	public readonly name = Event.Name.GuildMemberAdd;

	@LogExceptions
	public async execute([member]: Event.ArgumentsOf<this['name']>) {
		const { id: guildId, members, preferredLocale, roles } = member.guild;
		const [data] = await database.select().from(welcomeAndFarewell).where(eq(welcomeAndFarewell.guildId, guildId));

		if (!data?.welcomeChannelId || !data.welcomeEnabled) return;

		const channel = await fetchChannel(member.guild, data.welcomeChannelId);

		if (!channel?.isTextBased()) return;

		const me = await members.fetchMe();

		if (!channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

		if (data.welcomeNewMemberRoles.length > 0) {
			const highestRoleWithManageRoles = me.roles.cache
				.filter((role) => role.permissions.has([PermissionFlagsBits.ManageRoles]))
				// eslint-disable-next-line unicorn/no-array-sort
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

		const container = super.container((cont) =>
			welcomeContainer({
				container: cont,
				data: {
					welcomeMessageTitle: data.welcomeMessageTitle,
					welcomeMessageDescription: data.welcomeMessageDescription,
				},
				locale: preferredLocale,
				member,
			}),
		);

		void channel.send({ components: [container], flags: [MessageFlags.IsComponentsV2] });
	}
}
