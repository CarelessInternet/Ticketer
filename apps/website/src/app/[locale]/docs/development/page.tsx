import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import type { Metadata } from 'next';
import type { PageProperties } from '@/i18n/routing';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';
import Title from '@/components/Title';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
	title: 'Ticketer - Development',
	description: 'Tutorial on how to get started on developing the Ticketer codebase.',
	openGraph: {
		title: 'Ticketer - Development',
		description: 'Tutorial on how to get started on developing the Ticketer codebase.',
	},
} satisfies Metadata;

export default async function Page({ params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<>
			<Divider>
				<Title>Develop Ticketer</Title>
				<Paragraph>
					This page describes how to launch a{' '}
					<ExternalLink href="https://code.visualstudio.com">Visual Studio Code</ExternalLink> session using{' '}
					<ExternalLink href="https://containers.dev">Dev Containers</ExternalLink> to edit the code in Ticketer.
				</Paragraph>
				<Paragraph>
					The software which you will need installed is{' '}
					<ExternalLink href="https://www.docker.com/products/docker-desktop/">Docker Desktop</ExternalLink>. Docker
					Engine should also work fine if you do not want to use Docker Desktop.
				</Paragraph>
				<Paragraph>You will also need the Dev Containers extension installed in Visual Studio Code.</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="setting-up">Setting Up</ScrollLink>
				<Paragraph>
					Open Visual Studio Code, and inside the code editor, open the command palette and run the following command.
				</Paragraph>
				<CodeBlock clipboardText="Dev Containers: Clone Repository in Container Volume...">
					<span>Dev Containers: Clone Repository in Container Volume...</span>
				</CodeBlock>
				<Paragraph>
					It should prompt for a repository URL. Paste Ticketer&apos;s GitHub URL and afterwards choose the main branch:
				</Paragraph>
				<CodeBlock clipboardText="https://github.com/CarelessInternet/Ticketer.git">
					<span>https://github.com/CarelessInternet/Ticketer.git</span>
				</CodeBlock>
				<Paragraph>
					Once the Dev Container has started, you can get to coding. It&apos;s as simple as that! Do not forget to
					create the necessary bot development environment file to run the bot!
				</Paragraph>
			</Divider>
		</>
	);
}
