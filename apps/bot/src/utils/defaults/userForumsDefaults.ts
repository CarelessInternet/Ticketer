import { Colors, type EmbedBuilder, type GuildMember } from 'discord.js';
import type { userForumsConfigurations } from '@ticketer/database';

type Columns = typeof userForumsConfigurations.$inferSelect;

interface TitleOptions {
	displayName: GuildMember['displayName'];
	title: Columns['openingMessageTitle'];
}

interface DescriptionOptions {
	description: Columns['openingMessageDescription'];
	memberMention: ReturnType<GuildMember['toString']>;
}

const replaceMember = (text: string, member: string) => text.replaceAll('{member}', member);

export const userForumsOpeningMessageTitle = ({ displayName, title }: TitleOptions) =>
	replaceMember(title, displayName);
export const userForumsOpeningMessageDescription = ({ description, memberMention }: DescriptionOptions) =>
	replaceMember(description, memberMention);

interface EmbedOptions {
	description: DescriptionOptions['description'];
	embed: EmbedBuilder;
	member: GuildMember;
	title: TitleOptions['title'];
}

export const userForumEmbed = ({ description, embed, member, title }: EmbedOptions) =>
	embed
		.setColor(Colors.Greyple)
		.setTitle(userForumsOpeningMessageTitle({ title, displayName: member.displayName }))
		.setDescription(userForumsOpeningMessageDescription({ description, memberMention: member.toString() }));
