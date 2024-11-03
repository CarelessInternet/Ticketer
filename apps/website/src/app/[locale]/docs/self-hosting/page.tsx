import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import InternalLink from '@/components/InternalLink';
import type { Metadata } from 'next';
import type { PageProperties } from '@/i18n/routing';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import Title from '@/components/Title';
import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula';
import { setRequestLocale } from 'next-intl/server';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

SyntaxHighlighter.registerLanguage('yaml', yaml);

const composeFile = `name: 'ticketer'

services:
  database:
    container_name: ticketer-database
    image: mariadb:11
    restart: always
    healthcheck:
      test: ['CMD', 'healthcheck.sh', '--connect', '--innodb_initialized']
      interval: 10s
      retries: 3
      start_period: 10s
    networks:
      - ticketer-database-network
    volumes:
      - ticketer-database-data:/var/lib/mysql
    environment:
      MARIADB_DATABASE: \${DB_DATABASE}
      MARIADB_USER: \${DB_USER}
      MARIADB_PASSWORD: \${DB_PASSWORD}
      MYSQL_TCP_PORT: \${DB_PORT}
      MARIADB_RANDOM_ROOT_PASSWORD: true
    ports:
      - \${DB_PORT}:\${DB_PORT}

  bot:
    container_name: ticketer-bot
    # You can change "latest" to any available version such as "3.2.0".
    image: ghcr.io/carelessinternet/ticketer-bot:latest
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    networks:
      - ticketer-database-network
    env_file:
      - .env.bot.production.local
      - .env.database.production.local
    environment:
      NODE_ENV: production

networks:
  ticketer-database-network:
    driver: bridge

volumes:
  ticketer-database-data:
`;

const botEnvironmentTemplate = `DISCORD_APPLICATION_ID=""
DISCORD_BOT_TOKEN=""
DISCORD_GUILD_ID=""
DISCORD_OWNER_ID=""
`;

const databaseEnvironmentTemplate = `DB_HOST="ticketer-database"
DB_DATABASE="Ticketer"
DB_PORT=3306
DB_USER=""
DB_PASSWORD=""
`;

function EnvironmentHighlight({
	name,
	value,
	quotations = true,
}: {
	name: string;
	value?: string;
	quotations?: boolean;
}) {
	return (
		<span className="flex flex-row">
			<span className="text-amber-400">{name}</span>
			<span className="text-rose-400">=</span>
			<span className="text-emerald-400">
				{quotations ? <>&quot;{!!value && value}&quot;</> : <>{!!value && value}</>}
			</span>
		</span>
	);
}

export const metadata = {
	title: 'Ticketer - Self-Hosting',
	description: 'Documentation on how to self-host the Ticketer bot.',
	openGraph: {
		title: 'Ticketer - Self-Hosting',
		description: 'Documentation on how to self-host the Ticketer bot.',
	},
} satisfies Metadata;

export default async function Page({ params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<>
			<Divider>
				<Title>Self-Hosting Ticketer</Title>
				<Paragraph>
					Looking to host the Ticketer bot on your own machine or server? The only required software to do so is{' '}
					<ExternalLink href="https://docs.docker.com/engine/install/">Docker Engine</ExternalLink>. Need help? Join the{' '}
					<InternalLink href="/links/discord/support">Ticketer support server</InternalLink>! This tutorial assumes you
					are running Linux to self-host the bot but any other operating system should work fine as well.
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="creating-the-compose-file">Creating the Compose File</ScrollLink>
				<Paragraph>
					Create a directory/folder with any name (like "Ticketer") and then create a file in that directory named
					"compose.yaml".
				</Paragraph>
				<CodeBlock clipboardText="mkdir Ticketer && cd Ticketer">
					<span>
						<span className="text-green-500">mkdir </span>
						<span>Ticketer && </span>
						<span className="text-green-500">cd </span>
						<span>Ticketer</span>
					</span>
				</CodeBlock>
				<CodeBlock clipboardText="nano compose.yaml">
					<span>
						<span className="text-green-500">nano </span>
						<span>compose.yaml</span>
					</span>
				</CodeBlock>
				<Paragraph>Copy and paste the following content in the created file:</Paragraph>
				<SyntaxHighlighter language="yaml" style={dracula} showLineNumbers>
					{composeFile}
				</SyntaxHighlighter>
			</Divider>
			<Divider>
				<ScrollLink target="environment-variables">Environment Variables</ScrollLink>
				<Paragraph>
					You will need the credentials to the Discord bot/application. If you have not already, create a new{' '}
					<ExternalLink href="https://discord.com/developers/applications">Discord application</ExternalLink> (enable
					the &quot;Server Members&quot; intent!) and edit the following variables with the appropriate credentials in a
					new file named &quot;
					<i>.env.bot.production.local</i>&quot;. The variable <i>DISCORD_GUILD_ID</i> is the server (ID) where private
					commands go. Put the details inside the quotation marks for the variables that have them!
				</Paragraph>
				<CodeBlock clipboardText="nano .env.bot.production.local">
					<span>
						<span className="text-green-500">nano </span>
						<span>.env.bot.production.local</span>
					</span>
				</CodeBlock>
				<CodeBlock clipboardText={botEnvironmentTemplate} fileName=".env.bot.production.local">
					<span className="flex flex-col">
						<EnvironmentHighlight name="DISCORD_APPLICATION_ID" />
						<EnvironmentHighlight name="DISCORD_BOT_TOKEN" />
						<EnvironmentHighlight name="DISCORD_GUILD_ID" />
						<EnvironmentHighlight name="DISCORD_OWNER_ID" />
					</span>
				</CodeBlock>
				<Paragraph>
					The database also requires a few credentials to run. Create a file named &quot;
					<i>.env.database.production.local</i>&quot; and then create some login credentials with the following template
					below. You can change every variable to have whatever value you want except for <i>DB_HOST</i>.
				</Paragraph>
				<CodeBlock clipboardText="nano .env.database.production.local">
					<span>
						<span className="text-green-500">nano </span>
						<span>.env.database.production.local</span>
					</span>
				</CodeBlock>
				<CodeBlock clipboardText={databaseEnvironmentTemplate} fileName=".env.database.production.local">
					<span className="flex flex-col">
						<EnvironmentHighlight name="DB_HOST" value="ticketer-database" />
						<EnvironmentHighlight name="DB_DATABASE" value="Ticketer" />
						<EnvironmentHighlight name="DB_PORT" value="3306" quotations={false} />
						<EnvironmentHighlight name="DB_USER" />
						<EnvironmentHighlight name="DB_PASSWORD" />
					</span>
				</CodeBlock>
			</Divider>
			<Divider>
				<ScrollLink target="running-the-bot">Running the Bot</ScrollLink>
				<Paragraph>
					Now it is time to run the bot! Run the following command to start the database and bot (this may take some
					time):
				</Paragraph>
				<CodeBlock clipboardText="docker compose --env-file ./.env.database.production.local --file compose.yaml up -d">
					<span>
						<span className="text-green-500">docker </span>
						<span>compose --env-file ./.env.database.production.local --file compose.yaml up -d</span>
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
			</Divider>
			<Divider>
				<ScrollLink target="accessing-the-database">Accessing the Database</ScrollLink>
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
			</Divider>
		</>
	);
}
