import { database, eq, welcomeAndFarewell } from '@ticketer/database';
import { Event } from '@ticketer/djs-framework';
import { PermissionFlagsBits } from 'discord.js';
import { welcomeEmbed } from '@/utils';

export default class extends Event.Handler {
	public readonly name = Event.Name.GuildMemberAdd;

	public async execute([member]: Event.ArgumentsOf<this['name']>) {
		const guildId = BigInt(member.guild.id);
		const table = await database.select().from(welcomeAndFarewell).where(eq(welcomeAndFarewell.guildId, guildId));
		const data = table.at(0);

		if (!data || !data.welcomeChannelId || !data.welcomeEnabled) {
			return;
		}

		const channel = await member.guild.channels.fetch(data.welcomeChannelId.toString());

		if (!channel?.isTextBased()) {
			return;
		}

		const me = await member.guild.members.fetchMe();

		if (!channel.permissionsFor(me).has(PermissionFlagsBits.SendMessages)) {
			return;
		}

		if (data.welcomeNewMemberRoles.length > 0) {
			const highestRoleWithManageRoles = me.roles.cache
				.filter((role) => role.permissions.has(PermissionFlagsBits.ManageRoles))
				.sort((a, b) => b.position - a.position)
				.at(0);

			if (!highestRoleWithManageRoles) {
				return;
			}

			const serverRoles = await member.guild.roles.fetch();
			const notBotRoles = [...serverRoles.filter((role) => !role.tags).values()];
			const commonRoles = notBotRoles.filter((role) => data.welcomeNewMemberRoles.includes(role.id));

			// https://discordjs.dev/docs/packages/discord.js/main/RoleManager:Class#comparePositions
			// You can only add roles that are lower than the highest one (with the manage roles permission) that you have.
			const addableRoles = commonRoles.filter(
				(role) => member.guild.roles.comparePositions(role, highestRoleWithManageRoles) < 0,
			);

			await member.roles.add(addableRoles);
		}

		const embed = welcomeEmbed({
			data: {
				welcomeTitle: data.welcomeTitle,
				welcomeMessage: data.welcomeMessage,
			},
			embed: super.embed,
			locale: member.guild.preferredLocale,
			user: member.user,
		});

		channel.send({ embeds: [embed] });
	}
}
