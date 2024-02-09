import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import Image from 'next/image';
import type { Metadata } from 'next';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';
import SectionDivider from '@/components/SectionDivider';
import Title from '@/components/Title';

export const metadata: Metadata = {
	title: 'Ticketer - Commands',
	description: 'Documentation on the popular and important commands by the Ticketer bot.',
	openGraph: {
		title: 'Ticketer - Commands',
		description: 'Documentation on the popular and important commands by the Ticketer bot.',
	},
};

export default function Page() {
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
					may seem daunting at first, but play out nicely in practice.
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
						Afterwards, you can create a category with an emoji, title, and description using the command below.
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
						src="/commands-thread-tickets-edit.png"
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
					<Image src="/thread-tickets-ticket.png" alt="Picture of a new thread ticket." width={720} height={405} />
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
						src="/commands-thread-tickets-panel.png"
						alt="Picture of the ticket threads panel."
						width={384}
						height={216}
					/>
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
					src="/user-forums-message.png"
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
					src="/automatic-threads-thread.png"
					alt="Picture of the automatic threads message and thread."
					width={720}
					height={405}
				/>
			</Divider>
		</>
	);
}
