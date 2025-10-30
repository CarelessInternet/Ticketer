import {
	type ButtonBuilder,
	Colors,
	ContainerBuilder,
	type GuildMember,
	HeadingLevel,
	SectionBuilder,
	TextDisplayBuilder,
	heading,
} from 'discord.js';
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

const userForumsOpeningMessageTitle = ({ displayName, title }: TitleOptions) => replaceMember(title, displayName);
const userForumsOpeningMessageDescription = ({ description, memberMention }: DescriptionOptions) =>
	replaceMember(description, memberMention);

interface ContainerOptions {
	container?: ContainerBuilder;
	description: DescriptionOptions['description'];
	member: GuildMember;
	renameTitleButton?: ButtonBuilder;
	title: TitleOptions['title'];
}

export const userForumsContainer = ({
	container = new ContainerBuilder(),
	description,
	member,
	renameTitleButton,
	title,
}: ContainerOptions) => {
	const base = container.setAccentColor(Colors.Greyple);
	const containerTitle = new TextDisplayBuilder().setContent(
		heading(userForumsOpeningMessageTitle({ title, displayName: member.displayName }), HeadingLevel.One),
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
			userForumsOpeningMessageDescription({ description, memberMention: member.toString() }),
		),
	);
};
