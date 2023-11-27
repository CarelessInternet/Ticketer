import { Colors, type EmbedBuilder, type Locale, type Snowflake, type User, userMention } from 'discord.js';
import { translate } from '@/i18n';
import type { welcomeAndFarewell } from '@ticketer/database';

type Columns = typeof welcomeAndFarewell.$inferSelect;

interface BaseWelcomeAndFarewellOptions {
	locale: Locale;
}

interface TitleOptions extends BaseWelcomeAndFarewellOptions {
	displayName: User['displayName'];
	title: Columns['welcomeTitle'] | Columns['farewellTitle'];
}

interface MessageOptions extends BaseWelcomeAndFarewellOptions {
	userId: Snowflake;
	message: Columns['welcomeMessage'] | Columns['farewellMessage'];
}

const replaceMember = (text: string, user: string) => text.replaceAll('{member}', user);

// Use the user-defined texts if possible, otherwise use the inbuilt localised texts.
const welcomeTitle = ({ locale, displayName, title }: TitleOptions) =>
	title
		? replaceMember(title, displayName)
		: translate(locale).events.guildMemberAdd.welcome.title({ member: displayName });

const welcomeMessage = ({ locale, message, userId }: MessageOptions) =>
	message
		? replaceMember(message, userMention(userId))
		: translate(locale).events.guildMemberAdd.welcome.message({ member: userMention(userId) });

const farewellTitle = ({ locale, displayName, title }: TitleOptions) =>
	title
		? replaceMember(title, displayName)
		: translate(locale).events.guildMemberAdd.farewell.title({ member: displayName });

const farewellMessage = ({ locale, message, userId }: MessageOptions) =>
	message
		? replaceMember(message, userMention(userId))
		: translate(locale).events.guildMemberAdd.farewell.message({ member: userMention(userId) });

interface BaseWelcomeAndFarewellEmbedOptions {
	embed: EmbedBuilder;
	locale: Locale;
	user: User;
}

interface WelcomeEmbedOptions extends BaseWelcomeAndFarewellEmbedOptions {
	data: Pick<Columns, 'welcomeTitle' | 'welcomeMessage'>;
}

interface FarewellEmbedOptions extends BaseWelcomeAndFarewellEmbedOptions {
	data: Pick<Columns, 'farewellTitle' | 'farewellMessage'>;
}

export const welcomeEmbed = ({ data, embed, locale, user }: WelcomeEmbedOptions) =>
	embed
		.setColor(Colors.DarkBlue)
		.setTitle(welcomeTitle({ displayName: user.displayName, locale, title: data.welcomeTitle }))
		.setDescription(welcomeMessage({ locale, message: data.welcomeMessage, userId: user.id }))
		.setThumbnail(user.displayAvatarURL());

export const farewellEmbed = ({ data, embed, locale, user }: FarewellEmbedOptions) =>
	embed
		.setColor(Colors.Purple)
		.setTitle(farewellTitle({ displayName: user.displayName, locale, title: data.farewellTitle }))
		.setDescription(farewellMessage({ locale, message: data.farewellMessage, userId: user.id }))
		.setThumbnail(user.displayAvatarURL());
