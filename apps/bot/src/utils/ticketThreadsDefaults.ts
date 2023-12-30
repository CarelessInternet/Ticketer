import { Colors, type EmbedBuilder, type Locale, type Snowflake, type User, inlineCode, userMention } from 'discord.js';
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
	displayName: User['displayName'];
	title: Columns['openingMessageTitle'];
}

interface MessageDescriptionOptions extends BaseOptions, BaseMessageOptions {
	userId: Snowflake;
	description: Columns['openingMessageDescription'];
}

const replaceMessageCategory = (text: string, category: string) => text.replaceAll('{category}', category);
const replaceMember = (text: string, user: string) => text.replaceAll('{member}', user);

interface ReplaceTitleOptions extends BaseMessageOptions {
	displayName: MessageTitleOptions['displayName'];
	messageTitle: NonNullable<MessageTitleOptions['title']>;
}

interface ReplaceDescriptionOptions extends BaseMessageOptions {
	user: MessageDescriptionOptions['userId'];
	messageDescription: NonNullable<MessageDescriptionOptions['description']>;
}

const replaceMessageTitle = ({ categoryTitle, messageTitle, displayName }: ReplaceTitleOptions) =>
	replaceMember(replaceMessageCategory(messageTitle, categoryTitle), displayName);

const replaceMessageDescription = ({ categoryTitle, messageDescription, user }: ReplaceDescriptionOptions) =>
	replaceMember(replaceMessageCategory(messageDescription, categoryTitle), userMention(user));

const translations = (locale: BaseOptions['locale']) => translate(locale).tickets.threads.categories.configuration;

// Use the user-defined texts if possible, otherwise use the inbuilt localised texts.
export const openingMessageTitle = ({ categoryTitle, displayName, locale, title }: MessageTitleOptions) =>
	title
		? replaceMessageTitle({ categoryTitle, displayName, messageTitle: title })
		: translations(locale).openingMessage.title({ category: categoryTitle });

export const openingMessageDescription = ({ categoryTitle, description, locale, userId }: MessageDescriptionOptions) =>
	description
		? replaceMessageDescription({ categoryTitle, messageDescription: description, user: userId })
		: translations(locale).openingMessage.description({
				category: inlineCode(categoryTitle),
				member: userMention(userId),
			});

interface MessageEmbedOptions extends BaseOptions, BaseMessageOptions {
	description: MessageDescriptionOptions['description'];
	embed: EmbedBuilder;
	title: MessageTitleOptions['title'];
	user: User;
}

export const openingMessageEmbed = ({ categoryTitle, description, embed, locale, title, user }: MessageEmbedOptions) =>
	embed
		.setColor(Colors.Fuchsia)
		.setTitle(openingMessageTitle({ categoryTitle, displayName: user.displayName, locale, title }))
		.setDescription(openingMessageDescription({ categoryTitle, description, locale, userId: user.id }));
