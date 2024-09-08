import { Colors, type EmbedBuilder, type GuildMember } from 'discord.js';
import type { automaticThreadsConfigurations } from '@ticketer/database';

type Columns = typeof automaticThreadsConfigurations.$inferSelect;

interface TitleOptions {
	displayName: GuildMember['displayName'];
	title: Columns['openingMessageTitle'];
}

interface DescriptionOptions {
	description: Columns['openingMessageDescription'];
	memberMention: ReturnType<GuildMember['toString']>;
}

const replaceMember = (text: string, member: string) => text.replaceAll('{member}', member);

export const automaticThreadsOpeningMessageTitle = ({ displayName, title }: TitleOptions) =>
	replaceMember(title, displayName);
export const automaticThreadsOpeningMessageDescription = ({ description, memberMention }: DescriptionOptions) =>
	replaceMember(description, memberMention);

interface EmbedOptions {
	description: DescriptionOptions['description'];
	embed: EmbedBuilder;
	title: TitleOptions['title'];
	member: GuildMember;
}

export const automaticThreadsEmbed = ({ description, embed, member, title }: EmbedOptions) =>
	embed
		.setColor(Colors.Greyple)
		.setTitle(automaticThreadsOpeningMessageTitle({ title, displayName: member.displayName }))
		.setDescription(automaticThreadsOpeningMessageDescription({ description, memberMention: member.toString() }));
