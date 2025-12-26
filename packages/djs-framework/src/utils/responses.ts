import { env } from 'node:process';
import {
	type Client,
	Colors,
	ContainerBuilder,
	EmbedBuilder,
	type GuildMember,
	SeparatorBuilder,
	SeparatorSpacingSize,
	subtext,
	TextDisplayBuilder,
	TimestampStyles,
	time,
	type User,
} from 'discord.js';

interface Base {
	client: Client<true>;
}

/**
 * @returns Embed with a presetted footer and timestamp.
 */
export function embed({ client }: Base) {
	return new EmbedBuilder()
		.setColor(Colors.Blurple)
		.setTimestamp()
		.setFooter({ text: `Version ${env.npm_package_version}`, iconURL: client.user.displayAvatarURL() });
}

type Member = User | GuildMember;
type UserEmbed = (Base & { member: Member; user?: Member }) | (Base & { member?: Member; user: Member });

/**
 * @returns Embed with presetted data and a user.
 */
export function userEmbed({ client, member, user }: UserEmbed) {
	// biome-ignore lint/style/noNonNullAssertion: One of them exists.
	const userObject = member ?? user!;

	return embed({ client }).setAuthor({
		name: userObject.displayName,
		iconURL: userObject.displayAvatarURL(),
	});
}

/**
 * @returns Embed with presetted data for user errors.
 */
export function userEmbedError({
	client,
	description,
	member,
	user,
	title = 'You Hit an Error!',
}: UserEmbed & { description: string; title?: string }) {
	// biome-ignore lint/style/noNonNullAssertion: One of them exists.
	const userObject = member ?? user!;

	return userEmbed({ client, member: userObject, user: userObject })
		.setColor(Colors.DarkRed)
		.setTitle(title)
		.setDescription(description);
}

/**
 * @returns A container component with presetted data.
 */
export function container({
	builder,
	client,
}: Base & { builder: ContainerBuilder | ((cont: ContainerBuilder) => ContainerBuilder) }) {
	const cont = typeof builder === 'function' ? builder(new ContainerBuilder()) : builder;

	return cont
		.setAccentColor(cont.data.accent_color ?? Colors.Blurple)
		.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				subtext(
					`${client.user.displayName}: Version ${env.npm_package_version} • ${time(new Date(), TimestampStyles.ShortDateMediumTime)}`,
				),
			),
		);
}
