import { Colors, type EmbedBuilder, type Locale, type Snowflake, type User, userMention } from 'discord.js';
import { translate } from '@/i18n';
import type { welcomeAndFarewell } from '@ticketer/database';

type Columns = typeof welcomeAndFarewell.$inferSelect;

interface BaseWelcomeAndFarewellOptions {
	locale: Locale;
}

interface TitleOptions extends BaseWelcomeAndFarewellOptions {
	displayName: User['displayName'];
	title: Columns['welcomeMessageTitle'] | Columns['farewellMessageTitle'];
}

interface MessageOptions extends BaseWelcomeAndFarewellOptions {
	userId: Snowflake;
	description: Columns['welcomeMessageDescription'] | Columns['farewellMessageDescription'];
}

const replaceMember = (text: string, user: string) => text.replaceAll('{member}', user);

// Use the user-defined texts if possible, otherwise use the inbuilt localised texts.
const welcomeMessageTitle = ({ locale, displayName, title }: TitleOptions) =>
	title
		? replaceMember(title, displayName)
		: translate(locale).events.guildMemberAdd.welcome.title({ member: displayName });

const welcomeMessageDescription = ({ description, locale, userId }: MessageOptions) =>
	description
		? replaceMember(description, userMention(userId))
		: translate(locale).events.guildMemberAdd.welcome.message({ member: userMention(userId) });

const farewellMessageTitle = ({ locale, displayName, title }: TitleOptions) =>
	title
		? replaceMember(title, displayName)
		: translate(locale).events.guildMemberAdd.farewell.title({ member: displayName });

const farewellMessageDescription = ({ description, locale, userId }: MessageOptions) =>
	description
		? replaceMember(description, userMention(userId))
		: translate(locale).events.guildMemberAdd.farewell.message({ member: userMention(userId) });

interface BaseWelcomeAndFarewellEmbedOptions {
	embed: EmbedBuilder;
	locale: Locale;
	user: User;
}

interface WelcomeEmbedOptions extends BaseWelcomeAndFarewellEmbedOptions {
	data: Pick<Columns, 'welcomeMessageTitle' | 'welcomeMessageDescription'>;
}

interface FarewellEmbedOptions extends BaseWelcomeAndFarewellEmbedOptions {
	data: Pick<Columns, 'farewellMessageTitle' | 'farewellMessageDescription'>;
}

export const welcomeEmbed = ({ data, embed, locale, user }: WelcomeEmbedOptions) =>
	embed
		.setColor(Colors.DarkBlue)
		.setTitle(welcomeMessageTitle({ displayName: user.displayName, locale, title: data.welcomeMessageTitle }))
		.setDescription(welcomeMessageDescription({ description: data.welcomeMessageDescription, locale, userId: user.id }))
		.setThumbnail(user.displayAvatarURL());

export const farewellEmbed = ({ data, embed, locale, user }: FarewellEmbedOptions) =>
	embed
		.setColor(Colors.Purple)
		.setTitle(farewellMessageTitle({ displayName: user.displayName, locale, title: data.farewellMessageTitle }))
		.setDescription(
			farewellMessageDescription({ description: data.farewellMessageDescription, locale, userId: user.id }),
		)
		.setThumbnail(user.displayAvatarURL());
