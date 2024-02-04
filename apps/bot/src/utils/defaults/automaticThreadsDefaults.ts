import { Colors, type EmbedBuilder, type User } from 'discord.js';
import type { automaticThreadsConfigurations } from '@ticketer/database';

type Columns = typeof automaticThreadsConfigurations.$inferSelect;

interface TitleOptions {
	displayName: User['displayName'];
	title: Columns['openingMessageTitle'];
}

interface DescriptionOptions {
	description: Columns['openingMessageDescription'];
	userMention: ReturnType<User['toString']>;
}

const replaceMember = (text: string, member: string) => text.replaceAll('{member}', member);

export const automaticThreadsOpeningMessageTitle = ({ displayName, title }: TitleOptions) =>
	replaceMember(title, displayName);
export const automaticThreadsOpeningMessageDescription = ({ description, userMention }: DescriptionOptions) =>
	replaceMember(description, userMention);

interface EmbedOptions {
	description: DescriptionOptions['description'];
	embed: EmbedBuilder;
	title: TitleOptions['title'];
	user: User;
}

export const automaticThreadsEmbed = ({ description, embed, title, user }: EmbedOptions) =>
	embed
		.setColor(Colors.Greyple)
		.setTitle(automaticThreadsOpeningMessageTitle({ title, displayName: user.displayName }))
		.setDescription(automaticThreadsOpeningMessageDescription({ description, userMention: user.toString() }));
