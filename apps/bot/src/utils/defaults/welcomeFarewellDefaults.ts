import type { welcomeAndFarewell } from '@ticketer/database';
import {
	Colors,
	ContainerBuilder,
	type GuildMember,
	HeadingLevel,
	heading,
	type Locale,
	SectionBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from 'discord.js';
import { translate } from '@/i18n';

type Columns = typeof welcomeAndFarewell.$inferSelect;

interface BaseOptions {
	locale: Locale;
}

interface TitleOptions extends BaseOptions {
	displayName: GuildMember['displayName'];
	title: Columns['welcomeMessageTitle'] | Columns['farewellMessageTitle'];
}

interface DescriptionOptions extends BaseOptions {
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

interface BaseWelcomeAndFarewellContainerOptions extends BaseOptions {
	container?: ContainerBuilder;
	member: GuildMember;
}

interface WelcomeContainerOptions extends BaseWelcomeAndFarewellContainerOptions {
	data: Pick<Columns, 'welcomeMessageTitle' | 'welcomeMessageDescription'>;
}

interface FarewellContainerOptions extends BaseWelcomeAndFarewellContainerOptions {
	data: Pick<Columns, 'farewellMessageTitle' | 'farewellMessageDescription'>;
}

export const welcomeContainer = ({
	container = new ContainerBuilder(),
	data,
	locale,
	member,
}: Omit<WelcomeContainerOptions, 'embed'>) =>
	container
		.setAccentColor(Colors.DarkBlue)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				heading(
					welcomeMessageTitle({ displayName: member.displayName, locale, title: data.welcomeMessageTitle }),
					HeadingLevel.One,
				),
			),
		)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						welcomeMessageDescription({
							description: data.welcomeMessageDescription,
							locale,
							memberMention: member.toString(),
						}),
					),
				)
				.setThumbnailAccessory(new ThumbnailBuilder().setURL(member.displayAvatarURL())),
		);

export const farewellContainer = ({
	container = new ContainerBuilder(),
	data,
	locale,
	member,
}: Omit<FarewellContainerOptions, 'embed'>) =>
	container
		.setAccentColor(Colors.Purple)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				heading(
					farewellMessageTitle({ displayName: member.displayName, locale, title: data.farewellMessageTitle }),
					HeadingLevel.One,
				),
			),
		)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						farewellMessageDescription({
							description: data.farewellMessageDescription,
							locale,
							memberMention: member.toString(),
						}),
					),
				)
				.setThumbnailAccessory(new ThumbnailBuilder().setURL(member.displayAvatarURL())),
		);
