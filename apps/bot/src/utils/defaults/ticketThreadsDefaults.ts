import { Colors, type EmbedBuilder, type Locale, type User, inlineCode } from 'discord.js';
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
	description: Columns['openingMessageDescription'];
	userMention: ReturnType<User['toString']>;
}

const replaceMessageCategory = (text: string, category: string) => text.replaceAll('{category}', category);
const replaceMember = (text: string, member: string) => text.replaceAll('{member}', member);

interface ReplaceTitleOptions extends BaseMessageOptions {
	displayName: MessageTitleOptions['displayName'];
	messageTitle: NonNullable<MessageTitleOptions['title']>;
}

interface ReplaceDescriptionOptions extends BaseMessageOptions {
	messageDescription: NonNullable<MessageDescriptionOptions['description']>;
	userMention: MessageDescriptionOptions['userMention'];
}

const replaceMessageTitle = ({ categoryTitle, messageTitle, displayName }: ReplaceTitleOptions) =>
	replaceMember(replaceMessageCategory(messageTitle, categoryTitle), displayName);

const replaceMessageDescription = ({ categoryTitle, messageDescription, userMention }: ReplaceDescriptionOptions) =>
	replaceMember(replaceMessageCategory(messageDescription, categoryTitle), userMention);

const translations = (locale: BaseOptions['locale']) => translate(locale).tickets.threads.categories.configuration;

// Use the user-defined texts if possible, otherwise use the inbuilt localised texts.
export const ticketThreadsOpeningMessageTitle = ({ categoryTitle, displayName, locale, title }: MessageTitleOptions) =>
	title
		? replaceMessageTitle({ categoryTitle, displayName, messageTitle: title })
		: translations(locale).openingMessage.title({ category: categoryTitle });

export const ticketThreadsOpeningMessageDescription = ({
	categoryTitle,
	description,
	locale,
	userMention,
}: MessageDescriptionOptions) =>
	description
		? replaceMessageDescription({ categoryTitle, messageDescription: description, userMention })
		: translations(locale).openingMessage.description({
				category: inlineCode(categoryTitle),
				member: userMention,
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
		.setTitle(ticketThreadsOpeningMessageTitle({ categoryTitle, displayName: user.displayName, locale, title }))
		.setDescription(
			ticketThreadsOpeningMessageDescription({ categoryTitle, description, locale, userMention: user.toString() }),
		);
