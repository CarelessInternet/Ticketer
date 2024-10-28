import { Colors, type EmbedBuilder, type GuildMember, type Locale, inlineCode } from 'discord.js';
import { ThreadTicketing } from '..';
import type { ticketThreadsCategories } from '@ticketer/database';
import { translate } from '@/i18n';

type Columns = typeof ticketThreadsCategories.$inferSelect;

interface BaseOptions {
	locale: Locale;
}

interface BaseMessageOptions {
	categoryTitle: Columns['categoryTitle'];
}

interface MessageTitleOptions extends BaseOptions, BaseMessageOptions {
	categoryEmoji: Columns['categoryEmoji'];
	displayName: GuildMember['displayName'];
	title: Columns['openingMessageTitle'];
}

interface MessageDescriptionOptions extends BaseOptions, BaseMessageOptions {
	description: Columns['openingMessageDescription'];
	memberMention: ReturnType<GuildMember['toString']>;
}

const replaceMessageCategory = (text: string, category: string) => text.replaceAll('{category}', category);
const replaceMember = (text: string, member: string) => text.replaceAll('{member}', member);

interface ReplaceTitleOptions extends BaseMessageOptions {
	displayName: MessageTitleOptions['displayName'];
	messageTitle: NonNullable<MessageTitleOptions['title']>;
}

interface ReplaceDescriptionOptions extends BaseMessageOptions {
	messageDescription: NonNullable<MessageDescriptionOptions['description']>;
	memberMention: MessageDescriptionOptions['memberMention'];
}

const replaceMessageTitle = ({ categoryTitle, messageTitle, displayName }: ReplaceTitleOptions) =>
	replaceMember(replaceMessageCategory(messageTitle, categoryTitle), displayName);

const replaceMessageDescription = ({ categoryTitle, memberMention, messageDescription }: ReplaceDescriptionOptions) =>
	replaceMember(replaceMessageCategory(messageDescription, categoryTitle), memberMention);

const translations = (locale: BaseOptions['locale']) => translate(locale).tickets.threads.categories.configuration;

// Use the user-defined texts if possible, otherwise use the inbuilt localised texts.
export const ticketThreadsOpeningMessageTitle = ({
	categoryEmoji,
	categoryTitle,
	displayName,
	locale,
	title,
}: MessageTitleOptions) =>
	title
		? replaceMessageTitle({ categoryTitle, displayName, messageTitle: title })
		: ThreadTicketing.titleAndEmoji(categoryTitle, categoryEmoji) + ': ' + translations(locale).openingMessage.title();

export const ticketThreadsOpeningMessageDescription = ({
	categoryTitle,
	description,
	locale,
	memberMention,
}: MessageDescriptionOptions) =>
	description
		? replaceMessageDescription({ categoryTitle, memberMention, messageDescription: description })
		: translations(locale).openingMessage.description({
				category: inlineCode(categoryTitle),
				member: memberMention,
			});

interface MessageEmbedOptions extends BaseOptions, BaseMessageOptions {
	categoryEmoji: Columns['categoryEmoji'];
	description: MessageDescriptionOptions['description'];
	embed: EmbedBuilder;
	member: GuildMember;
	title: MessageTitleOptions['title'];
}

export const ticketThreadsOpeningMessageEmbed = ({
	categoryEmoji,
	categoryTitle,
	description,
	embed,
	locale,
	member,
	title,
}: MessageEmbedOptions) =>
	embed
		.setColor(Colors.Fuchsia)
		.setTitle(
			ticketThreadsOpeningMessageTitle({
				categoryEmoji,
				categoryTitle,
				displayName: member.displayName,
				locale,
				title,
			}),
		)
		.setDescription(
			ticketThreadsOpeningMessageDescription({ categoryTitle, description, locale, memberMention: member.toString() }),
		);
