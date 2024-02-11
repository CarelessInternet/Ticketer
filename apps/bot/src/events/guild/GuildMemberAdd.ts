import { LogExceptions, welcomeEmbed } from '@/utils';
import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';

export default class extends Event.Handler {
	public readonly name = Event.Name.GuildMemberAdd;

	@LogExceptions
	public async execute([member]: Event.ArgumentsOf<this['name']>) {
		const { channels, id: guildId, members, preferredLocale, roles } = member.guild;
		const [data] = await database.select().from(welcomeAndFarewell).where(eq(welcomeAndFarewell.guildId, guildId));

		if (!data?.welcomeChannelId || !data.welcomeEnabled) return;

		const channel = await channels.fetch(data.welcomeChannelId);

		if (!channel?.isTextBased()) return;

		const me = await members.fetchMe();

		if (!channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

		if (data.welcomeNewMemberRoles.length > 0) {
			const highestRoleWithManageRoles = me.roles.cache
				.filter((role) => role.permissions.has(PermissionFlagsBits.ManageRoles))
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

		const embed = welcomeEmbed({
			data: {
				welcomeMessageTitle: data.welcomeMessageTitle,
				welcomeMessageDescription: data.welcomeMessageDescription,
			},
			embed: super.embed,
			locale: preferredLocale,
			user: member.user,
		});

		void channel.send({ embeds: [embed] });
	}
}
