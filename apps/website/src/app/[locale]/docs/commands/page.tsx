import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import Image from '@/components/Image';
import type { Metadata } from 'next';
import type { PageProperties } from '@/i18n/routing';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';
import SectionDivider from '@/components/SectionDivider';
import Title from '@/components/Title';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
	title: 'Ticketer - Commands',
	description: 'Documentation on the popular and important commands by the Ticketer bot.',
	openGraph: {
		title: 'Ticketer - Commands',
		description: 'Documentation on the popular and important commands by the Ticketer bot.',
	},
} satisfies Metadata;

export default async function Page({ params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<>
			<Divider>
				<Title>Ticketer Commands</Title>
				<Paragraph>Read about some of the important commands in Ticketer as a moderator or user of the bot!</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="thread-tickets">Thread Tickets</ScrollLink>
				<Paragraph>
					The main focus of the bot is on threads which act as tickets. There are several parts to this feature which
					may seem daunting at first, but play out well in practice.
				</Paragraph>
				<SectionDivider header="Configuring Thread Tickets">
					<Paragraph>
						To get started with thread tickets as a moderator, run the subcommands under the subcommand group{' '}
						<i>/configuration-ticket-threads global-settings</i>. There is currently only one configuration to set: the
						amount of active tickets a user may have globally at once.
					</Paragraph>
					<CodeBlock clipboardText="/configuration-ticket-threads global-settings active-tickets" slashCommand>
						<span>configuration-ticket-threads global-settings active-tickets</span>
					</CodeBlock>
					<Paragraph>
						Afterwards, you can create a category with an emoji (optional), title, and description using the command
						below.
					</Paragraph>
					<CodeBlock clipboardText="/configuration-ticket-threads categories create" slashCommand>
						<span>configuration-ticket-threads categories create</span>
					</CodeBlock>
					<Paragraph>
						You then need to choose the &quot;ticket managers&quot; who are responsible for the category, as well as the
						text channel where these tickets go. These settings, including more, can be found using the subcommand
						below:
					</Paragraph>
					<CodeBlock clipboardText="/configuration-ticket-threads categories edit" slashCommand>
						<span>configuration-ticket-threads categories edit</span>
					</CodeBlock>
					<Image
						src="/images/commands-thread-tickets-edit.png"
						alt="Picture of the ticket threads edit select menu."
						width={384}
						height={216}
					/>
				</SectionDivider>
				<SectionDivider header="Creating a Ticket">
					<Paragraph>To create a ticket, use the command below:</Paragraph>
					<CodeBlock clipboardText="/ticket" slashCommand>
						<span>ticket</span>
					</CodeBlock>
					<Paragraph>An example of a ticket looks like the following picture:</Paragraph>
					<Image
						src="/images/thread-tickets-ticket.png"
						alt="Picture of a new thread ticket."
						width={720}
						height={405}
					/>
				</SectionDivider>
				<SectionDivider header="Creating a Panel">
					<Paragraph>
						If you want to create a panel where users can click on a button to create a ticket, use the command below.
						You can also edit the title and description of the embed.
					</Paragraph>
					<CodeBlock clipboardText="/panel" slashCommand>
						<span>panel</span>
					</CodeBlock>
					<Image
						src="/images/commands-thread-tickets-panel.png"
						alt="Picture of the ticket threads panel."
						width={384}
						height={216}
					/>
				</SectionDivider>
				<SectionDivider header="Ticket Actions">
					<Paragraph>
						There are multiple actions you can do on a ticket. This includes renaming the title, locking the thread,
						closing the thread, locking and closing the thread, and finally deleting the ticket. As a ticket author or
						manager, you can run these actions either through the commands or the buttons in the original ticket
						message.
					</Paragraph>
				</SectionDivider>
			</Divider>
			<Divider>
				<ScrollLink target="user-forums">User Forums</ScrollLink>
				<Paragraph>
					In addition to thread tickets, Ticketer provides a way to send a message everytime a new thread in a specified
					forum is created. The subcommand to create a new user forum configuration goes as follows:
				</Paragraph>
				<CodeBlock clipboardText="/configuration-user-forums create" slashCommand>
					<span>configuration-user-forums create</span>
				</CodeBlock>
				<Image
					src="/images/user-forums-message.png"
					alt="Picture of the user forums thread message."
					width={720}
					height={405}
				/>
			</Divider>
			<Divider>
				<ScrollLink target="automatic-threads">Automatic Threads</ScrollLink>
				<Paragraph>
					Similar to user forums, Ticketer can create a thread under a new message sent in a specified text channel. The
					subcommand below can be used to create a new configuration for automatic threads.
				</Paragraph>
				<CodeBlock clipboardText="/configuration-automatic-threads create" slashCommand>
					<span>configuration-automatic-threads create</span>
				</CodeBlock>
				<Image
					src="/images/automatic-threads-thread.png"
					alt="Picture of the automatic threads message and thread."
					width={720}
					height={405}
				/>
			</Divider>
			<Divider>
				<ScrollLink target="miscellaneous">Miscellaneous</ScrollLink>
				<Paragraph>A popular command for server moderators is the common purge command:</Paragraph>
				<CodeBlock clipboardText="/purge" slashCommand>
					<span>purge</span>
				</CodeBlock>
			</Divider>
		</>
	);
}
