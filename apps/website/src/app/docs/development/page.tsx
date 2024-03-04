import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';
import Title from '@/components/Title';

export default function Page() {
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
				<Paragraph>You will also need the WSL and Dev Containers extensions installed in Visual Studio Code.</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="using-docker-desktop">Using Docker Desktop</ScrollLink>
				<Paragraph>
					Once Docker Desktop is launched, navigate to the &quot;Dev Environments&quot; section on the left and create a
					new environment. In the source, paste Ticketer&apos;s Git URL below. Continue and you should be able to open
					the source code in a Dev Container in VS Code!
				</Paragraph>
				<CodeBlock clipboardText="https://github.com/CarelessInternet/Ticketer.git">
					<span>https://github.com/CarelessInternet/Ticketer.git</span>
				</CodeBlock>
			</Divider>
			<Divider>
				<ScrollLink target="using-docker-engine">Using Docker Engine</ScrollLink>
				<Paragraph>
					Similarly, you can use Docker Engine to spin up a Dev Container (theoretically). Pull the source code from
					GitHub using the command below and open Visual Studio Code in the directory.
				</Paragraph>
				<CodeBlock clipboardText="git clone https://github.com/CarelessInternet/Ticketer.git">
					<span>
						<span className="text-green-500">git </span>
						<span>clone https://github.com/CarelessInternet/Ticketer.git</span>
					</span>
				</CodeBlock>
				<Paragraph>
					Inside the code editor, open the command palette and run the following command to edit inside a Dev Container:
				</Paragraph>
				<CodeBlock clipboardText="Dev Containers: Rebuild and Reopen in Container">
					<span>Dev Containers: Rebuild and Reopen in Container</span>
				</CodeBlock>
			</Divider>
		</>
	);
}
