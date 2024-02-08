import { Colors, type EmbedBuilder, type User } from 'discord.js';
import type { userForumsConfigurations } from '@ticketer/database';

type Columns = typeof userForumsConfigurations.$inferSelect;

interface TitleOptions {
	displayName: User['displayName'];
	title: Columns['openingMessageTitle'];
}

interface DescriptionOptions {
	description: Columns['openingMessageDescription'];
	userMention: ReturnType<User['toString']>;
}

const replaceMember = (text: string, member: string) => text.replaceAll('{member}', member);

export const userForumsOpeningMessageTitle = ({ displayName, title }: TitleOptions) =>
	replaceMember(title, displayName);
export const userForumsOpeningMessageDescription = ({ description, userMention }: DescriptionOptions) =>
	replaceMember(description, userMention);

interface EmbedOptions {
	description: DescriptionOptions['description'];
	embed: EmbedBuilder;
	title: TitleOptions['title'];
	user: User;
}

export const userForumEmbed = ({ description, embed, title, user }: EmbedOptions) =>
	embed
		.setColor(Colors.Greyple)
		.setTitle(userForumsOpeningMessageTitle({ title, displayName: user.displayName }))
		.setDescription(userForumsOpeningMessageDescription({ description, userMention: user.toString() }));
