import type { automaticThreadsConfigurations } from '@ticketer/database';
import {
	type ButtonBuilder,
	Colors,
	ContainerBuilder,
	type GuildMember,
	HeadingLevel,
	heading,
	SectionBuilder,
	TextDisplayBuilder,
} from 'discord.js';

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

const automaticThreadsOpeningMessageTitle = ({ displayName, title }: TitleOptions) => replaceMember(title, displayName);
const automaticThreadsOpeningMessageDescription = ({ description, memberMention }: DescriptionOptions) =>
	replaceMember(description, memberMention);

interface ContainerOptions {
	container?: ContainerBuilder;
	description: DescriptionOptions['description'];
	member: GuildMember;
	renameTitleButton?: ButtonBuilder;
	title: TitleOptions['title'];
}

export const automaticThreadsContainer = ({
	container = new ContainerBuilder(),
	description,
	member,
	renameTitleButton,
	title,
}: ContainerOptions) => {
	const base = container.setAccentColor(Colors.Greyple);
	const containerTitle = new TextDisplayBuilder().setContent(
		heading(automaticThreadsOpeningMessageTitle({ title, displayName: member.displayName }), HeadingLevel.One),
	);

	if (renameTitleButton) {
		base.addSectionComponents(
			new SectionBuilder().addTextDisplayComponents(containerTitle).setButtonAccessory(renameTitleButton),
		);
	} else {
		base.addTextDisplayComponents(containerTitle);
	}

	return base.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			automaticThreadsOpeningMessageDescription({ description, memberMention: member.toString() }),
		),
	);
};
