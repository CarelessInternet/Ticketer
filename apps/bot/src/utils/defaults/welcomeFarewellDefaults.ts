import { Colors, type EmbedBuilder, type Locale, type User } from 'discord.js';
import { translate } from '@/i18n';
import type { welcomeAndFarewell } from '@ticketer/database';

type Columns = typeof welcomeAndFarewell.$inferSelect;

interface BaseOptions {
	locale: Locale;
}

interface TitleOptions extends BaseOptions {
	displayName: User['displayName'];
	// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
	title: Columns['welcomeMessageTitle'] | Columns['farewellMessageTitle'];
}

interface DescriptionOptions extends BaseOptions {
	// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
	description: Columns['welcomeMessageDescription'] | Columns['farewellMessageDescription'];
	userMention: ReturnType<User['toString']>;
}

const replaceMember = (text: string, member: string) => text.replaceAll('{member}', member);
const translations = (locale: BaseOptions['locale']) => translate(locale).events.guildMemberAdd;

// Use the user-defined texts if possible, otherwise use the inbuilt localised texts.
const welcomeMessageTitle = ({ locale, displayName, title }: TitleOptions) =>
	title ? replaceMember(title, displayName) : translations(locale).welcome.title({ member: displayName });

const welcomeMessageDescription = ({ description, locale, userMention }: DescriptionOptions) =>
	description ? replaceMember(description, userMention) : translations(locale).welcome.message({ member: userMention });

const farewellMessageTitle = ({ locale, displayName, title }: TitleOptions) =>
	title ? replaceMember(title, displayName) : translations(locale).farewell.title({ member: displayName });

const farewellMessageDescription = ({ description, locale, userMention }: DescriptionOptions) =>
	description
		? replaceMember(description, userMention)
		: translations(locale).farewell.message({ member: userMention });

interface BaseWelcomeAndFarewellEmbedOptions extends BaseOptions {
	embed: EmbedBuilder;
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
		.setDescription(
			welcomeMessageDescription({ description: data.welcomeMessageDescription, locale, userMention: user.toString() }),
		)
		.setThumbnail(user.displayAvatarURL());

export const farewellEmbed = ({ data, embed, locale, user }: FarewellEmbedOptions) =>
	embed
		.setColor(Colors.Purple)
		.setTitle(farewellMessageTitle({ displayName: user.displayName, locale, title: data.farewellMessageTitle }))
		.setDescription(
			farewellMessageDescription({
				description: data.farewellMessageDescription,
				locale,
				userMention: user.toString(),
			}),
		)
		.setThumbnail(user.displayAvatarURL());
