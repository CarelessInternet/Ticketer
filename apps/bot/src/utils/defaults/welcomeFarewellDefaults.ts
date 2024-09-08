import { Colors, type EmbedBuilder, type GuildMember, type Locale } from 'discord.js';
import { translate } from '@/i18n';
import type { welcomeAndFarewell } from '@ticketer/database';

type Columns = typeof welcomeAndFarewell.$inferSelect;

interface BaseOptions {
	locale: Locale;
}

interface TitleOptions extends BaseOptions {
	displayName: GuildMember['displayName'];
	// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
	title: Columns['welcomeMessageTitle'] | Columns['farewellMessageTitle'];
}

interface DescriptionOptions extends BaseOptions {
	// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
	description: Columns['welcomeMessageDescription'] | Columns['farewellMessageDescription'];
	memberMention: ReturnType<GuildMember['toString']>;
}

const replaceMember = (text: string, member: string) => text.replaceAll('{member}', member);
const translations = (locale: BaseOptions['locale']) => translate(locale).events.guildMemberAdd;

// Use the user-defined texts if possible, otherwise use the inbuilt localised texts.
const welcomeMessageTitle = ({ locale, displayName, title }: TitleOptions) =>
	title ? replaceMember(title, displayName) : translations(locale).welcome.title({ member: displayName });

const welcomeMessageDescription = ({ description, locale, memberMention }: DescriptionOptions) =>
	description
		? replaceMember(description, memberMention)
		: translations(locale).welcome.message({ member: memberMention });

const farewellMessageTitle = ({ locale, displayName, title }: TitleOptions) =>
	title ? replaceMember(title, displayName) : translations(locale).farewell.title({ member: displayName });

const farewellMessageDescription = ({ description, locale, memberMention }: DescriptionOptions) =>
	description
		? replaceMember(description, memberMention)
		: translations(locale).farewell.message({ member: memberMention });

interface BaseWelcomeAndFarewellEmbedOptions extends BaseOptions {
	embed: EmbedBuilder;
	member: GuildMember;
}

interface WelcomeEmbedOptions extends BaseWelcomeAndFarewellEmbedOptions {
	data: Pick<Columns, 'welcomeMessageTitle' | 'welcomeMessageDescription'>;
}

interface FarewellEmbedOptions extends BaseWelcomeAndFarewellEmbedOptions {
	data: Pick<Columns, 'farewellMessageTitle' | 'farewellMessageDescription'>;
}

export const welcomeEmbed = ({ data, embed, locale, member }: WelcomeEmbedOptions) =>
	embed
		.setColor(Colors.DarkBlue)
		.setTitle(welcomeMessageTitle({ displayName: member.displayName, locale, title: data.welcomeMessageTitle }))
		.setDescription(
			welcomeMessageDescription({
				description: data.welcomeMessageDescription,
				locale,
				memberMention: member.toString(),
			}),
		)
		.setThumbnail(member.displayAvatarURL());

export const farewellEmbed = ({ data, embed, locale, member }: FarewellEmbedOptions) =>
	embed
		.setColor(Colors.Purple)
		.setTitle(farewellMessageTitle({ displayName: member.displayName, locale, title: data.farewellMessageTitle }))
		.setDescription(
			farewellMessageDescription({
				description: data.farewellMessageDescription,
				locale,
				memberMention: member.toString(),
			}),
		)
		.setThumbnail(member.displayAvatarURL());
