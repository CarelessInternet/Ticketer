import { Colors, EmbedBuilder, User } from 'discord.js';
import type { Client } from '.';
import { env } from 'node:process';

/**
 * The base for all executable classes.
 */
export abstract class Base {
	public constructor(protected readonly client: Client) {}

	/**
	 * @returns Embed with a presetted footer and timestamp.
	 */
	protected get embed() {
		return new EmbedBuilder()
			.setColor(Colors.Blurple)
			.setTimestamp()
			.setFooter({ text: `Version ${env.npm_package_version}`, iconURL: this.client.user?.displayAvatarURL() });
	}

	/**
	 * @returns Embed with presetted data and a user.
	 */
	protected userEmbed(user: User) {
		return this.embed.setAuthor({
			name: user.displayName,
			iconURL: user.displayAvatarURL(),
		});
	}

	/**
	 * @returns Embed with presetted data for user errors.
	 */
	protected userEmbedError(user: User) {
		return this.userEmbed(user).setColor(Colors.DarkRed).setTitle('You Hit an Error!');
	}

	// The return type is `any` because the function should be able to return anything or nothing.
	// Type `unknown` is more suitable but gave errors.
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	public abstract execute(...parameters: unknown[]): any;
}
