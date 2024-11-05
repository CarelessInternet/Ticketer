import { getTranslations, setRequestLocale } from 'next-intl/server';
import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import type { Metadata } from 'next';
import type { PageProperties } from '@/i18n/routing';
import Paragraph from '@/components/Paragraph';
import RichText from '@/components/RichText';
import ScrollLink from '@/components/ScrollLink';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import Title from '@/components/Title';
import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula';
import { mergeMetadata } from '@/lib/mergeMetadata';
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
    # You can change "latest" to any available version such as "3.2.3".
    image: ghcr.io/carelessinternet/ticketer-bot:latest
    # Change the platform to the one on your linux environment (amd64, arm64).
    platform: linux/arm64
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

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'layout.navbar.navigation.documentation.routes.self-hosting' });

	return mergeMetadata({ description: t('description'), locale, title: t('title') });
}

export default async function Page({ params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations('pages.docs.self-hosting');

	return (
		<>
			<Divider>
				<Title>{t('heading.title')}</Title>
				<Paragraph>
					<RichText>
						{(tags) =>
							t.rich('heading.description', {
								linkDocker: (chunk) => (
									<ExternalLink href="https://docs.docker.com/engine/install/">{chunk}</ExternalLink>
								),
								...tags,
							})
						}
					</RichText>
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="creating-the-compose-file">{t('content.creating-the-compose-file.title')}</ScrollLink>
				<Paragraph>{t('content.creating-the-compose-file.paragraphs.1')}</Paragraph>
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
				<Paragraph>{t('content.creating-the-compose-file.paragraphs.2')}</Paragraph>
				<SyntaxHighlighter language="yaml" style={dracula} showLineNumbers>
					{composeFile}
				</SyntaxHighlighter>
			</Divider>
			<Divider>
				<ScrollLink target="environment-variables">{t('content.environment-variables.title')}</ScrollLink>
				<Paragraph>
					<RichText>
						{(tags) =>
							t.rich('content.environment-variables.paragraphs.1', {
								linkDiscordApplication: (chunk) => (
									<ExternalLink href="https://discord.com/developers/applications">{chunk}</ExternalLink>
								),
								...tags,
							})
						}
					</RichText>
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
					<RichText>{(tags) => t.rich('content.environment-variables.paragraphs.2', tags)}</RichText>
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
				<ScrollLink target="running-the-bot">{t('content.running-the-bot.title')}</ScrollLink>
				<Paragraph>{t('content.running-the-bot.paragraphs.1')}</Paragraph>
				<CodeBlock clipboardText="docker compose --env-file ./.env.database.production.local --file compose.yaml up -d">
					<span>
						<span className="text-green-500">docker </span>
						<span>compose --env-file ./.env.database.production.local --file compose.yaml up -d</span>
					</span>
				</CodeBlock>
				<Paragraph>{t('content.running-the-bot.paragraphs.2')}</Paragraph>
				<CodeBlock clipboardText='docker exec ticketer-bot sh -c "cd /src/apps/bot && pnpm commands:deploy:production"'>
					<span>
						<span className="text-green-500">docker </span>
						<span>exec ticketer-bot sh -c &quot;cd /src/apps/bot && pnpm commands:deploy:production&quot;</span>
					</span>
				</CodeBlock>
				<Paragraph>
					<RichText>{(tags) => t.rich('content.running-the-bot.paragraphs.3', tags)}</RichText>
				</Paragraph>
				<CodeBlock clipboardText={'/' + t('content.running-the-bot.command')} slashCommand>
					<span>{t('content.running-the-bot.command')}</span>
				</CodeBlock>
				<Paragraph>{t('content.running-the-bot.paragraphs.4')}</Paragraph>
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
				<ScrollLink target="accessing-the-database">{t('content.accessing-the-database.title')}</ScrollLink>
				<Paragraph>
					<RichText>{(tags) => t.rich('content.accessing-the-database.description', tags)}</RichText>
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
