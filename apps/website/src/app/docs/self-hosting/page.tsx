import type { HTMLAttributes, PropsWithChildren } from 'react';
import CodeBlock from '@/components/CodeBlock';
import ScrollLink from '@/components/ScrollLink';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

function Paragraph({ children, className }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
	return <p className={cn('pb-2 text-base sm:text-lg', className)}>{children}</p>;
}

function ExternalLink({ children, href }: PropsWithChildren<{ href: string }>) {
	return (
		<a className="text-blue-600 hover:underline dark:text-blue-500" target="_blank" href={href}>
			{children}
		</a>
	);
}

function EnvironmentHighlight({ name, value }: { name: string; value?: string }) {
	return (
		<span className="flex flex-row">
			<span className="text-amber-400">{name}</span>
			<span className="text-rose-400">=</span>
			<span className="text-emerald-400">&quot;{!!value && value}&quot;</span>
		</span>
	);
}

const databaseEnvironmentTemplate = `
	DB_HOST="database"
	DB_DATABASE="ticketer"
	DB_USER=""
	DB_PASSWORD=""
`;

const botEnvironmentTemplate = `
	DISCORD_APPLICATION_ID=""
	DISCORD_BOT_TOKEN=""
	DISCORD_GUILD_ID=""
	DISCORD_OWNER_ID=""
`;

export default function Page() {
	return (
		<>
			<div className="flex flex-col space-y-12 pt-4">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold sm:text-4xl">Self-Hosting Ticketer</h1>
					<Paragraph>
						Looking to host the Ticketer bot on your own machine? Here is the required software to do so:
					</Paragraph>
					<ul className="m-auto list-disc pl-10 font-medium">
						<li>
							<ExternalLink href="https://git-scm.com/book/en/v2/Getting-Started-Installing-Git">Git</ExternalLink>
						</li>
						<li>
							<ExternalLink href="https://docs.docker.com/get-docker/">Docker</ExternalLink>
						</li>
					</ul>
					<Paragraph className="pt-2">
						Need help? Join the{' '}
						<ExternalLink href="https://discord.gg/9FHagm6343">Ticketer support server</ExternalLink>!
					</Paragraph>
				</div>
				<div className="space-y-2">
					<ScrollLink href="/docs/self-hosting#cloning-the-repository">Cloning the Repository</ScrollLink>
					<Paragraph>
						Once you have Git and Docker installed, run the following command in a command line to clone the source code
						into a folder named &quot;Ticketer&quot;:
					</Paragraph>
					<CodeBlock clipboardText="git clone https://github.com/CarelessInternet/Ticketer.git">
						<span>
							<span className="text-green-500">git </span>
							<span>clone https://github.com/CarelessInternet/Ticketer.git</span>
						</span>
					</CodeBlock>
					<Paragraph>Afterwards, you need to change the directory to the Ticketer folder:</Paragraph>
					<CodeBlock clipboardText="cd Ticketer">
						<span>
							<span className="text-green-500">cd </span>
							<span>Ticketer</span>
						</span>
					</CodeBlock>
				</div>
				<div className="space-y-2">
					<ScrollLink href="/docs/self-hosting#environment-variables">Environment Variables</ScrollLink>
					<Paragraph>
						Both the bot and the database require a few credentials to run. Starting with the database, you will to
						create a file named &quot;<i>.env.database.production.local</i>&quot; and then create some login credentials
						with the following template (put the login details in the quotation marks!):
					</Paragraph>
					<CodeBlock clipboardText={databaseEnvironmentTemplate} fileName=".env.database.production.local">
						<span className="flex flex-col">
							<EnvironmentHighlight name="DB_HOST" value="database" />
							<EnvironmentHighlight name="DB_DATABASE" value="Ticketer" />
							<EnvironmentHighlight name="DB_USER" />
							<EnvironmentHighlight name="DB_PASSWORD" />
						</span>
					</CodeBlock>
					<Paragraph>
						In addition, you will need the credentials to the Discord bot/application. If you have not already, create a
						new <ExternalLink href="https://discord.com/developers/applications">Discord application</ExternalLink>{' '}
						(enable the &quot;Server Members&quot; intent!) and edit the following variables with the appropriate
						credentials in a new file named &quot;
						<i>.env.bot.production.local</i>&quot;. The variable <i>DISCORD_GUILD_ID</i> is the server (ID) where
						private commands go.
					</Paragraph>
					<CodeBlock clipboardText={botEnvironmentTemplate} fileName=".env.bot.production.local">
						<span className="flex flex-col">
							<EnvironmentHighlight name="DISCORD_APPLICATION_ID" />
							<EnvironmentHighlight name="DISCORD_BOT_TOKEN" />
							<EnvironmentHighlight name="DISCORD_GUILD_ID" />
							<EnvironmentHighlight name="DISCORD_OWNER_ID" />
						</span>
					</CodeBlock>
				</div>
				<div className="space-y-2">
					<ScrollLink href="/docs/self-hosting#running-the-bot">Running the Bot</ScrollLink>
					<Paragraph>
						Now it is time to run the bot! Run the following command to start the database and bot (this may take some
						time):
					</Paragraph>
					<CodeBlock clipboardText="docker compose --env-file ./.env.database.production.local --env-file ./.env.bot.production.local up -d">
						<span>
							<span className="text-green-500">docker </span>
							<span>
								compose --env-file ./.env.database.production.local --env-file ./.env.bot.production.local up -d
							</span>
						</span>
					</CodeBlock>
					<Paragraph>To deploy the application commands of the bot, run the following line:</Paragraph>
					<CodeBlock clipboardText='docker exec ticketer-bot sh -c "cd /src/apps/bot && pnpm commands:deploy:production"'>
						<span>
							<span className="text-green-500">docker </span>
							<span>exec ticketer-bot sh -c &quot;cd /src/apps/bot && pnpm commands:deploy:production&quot;</span>
						</span>
					</CodeBlock>
					<Paragraph>
						Once the commands have been deployed, run the <i>/migrate</i> command in Discord to deploy any database
						changes that may be needed:
					</Paragraph>
					<CodeBlock clipboardText="/migrate" slashCommand>
						<span>migrate</span>
					</CodeBlock>
					<Paragraph>If you want to stop the database and bot, run the commands below:</Paragraph>
					<CodeBlock clipboardText="docker container stop ticketer-bot">
						<span>
							<span className="text-green-500">docker </span>
							<span>container stop ticketer-bot</span>
						</span>
					</CodeBlock>
					<CodeBlock clipboardText="docker container stop ticketer-database">
						<span>
							<span className="text-green-500">docker </span>
							<span>container stop ticketer-database</span>
						</span>
					</CodeBlock>
				</div>
				<div className="space-y-2">
					<ScrollLink href="/docs/self-hosting#accessing-the-database">Accessing the Database</ScrollLink>
					<Paragraph>
						If you want to access the database, you can do so by running the two commands below and replacing &quot;
						<i>USERNAME</i>&quot; with the username you chose in the environment variable:
					</Paragraph>
					<CodeBlock clipboardText="docker exec -it ticketer-database bash">
						<span>
							<span className="text-green-500">docker </span>
							<span>exec -it ticketer-database bash</span>
						</span>
					</CodeBlock>
					<CodeBlock clipboardText="mariadb -u USERNAME -p">
						<span>
							<span className="text-green-500">mariadb </span>
							<span>-u USERNAME -p</span>
						</span>
					</CodeBlock>
				</div>
			</div>
			<Toaster />
		</>
	);
}
