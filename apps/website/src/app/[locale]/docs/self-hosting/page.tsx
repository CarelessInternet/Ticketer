import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Code } from 'bright';
import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import type { Locale } from 'next-intl';
import type { Metadata } from 'next';
import Paragraph from '@/components/Paragraph';
import RichText from '@/components/RichText';
import ScrollLink from '@/components/ScrollLink';
import Title from '@/components/Title';
import { mergeMetadata } from '@/lib/mergeMetadata';

const composeFile = `
name: 'ticketer'

services:
  database:
    image: mariadb:11
    container_name: ticketer-database
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'healthcheck.sh', '--connect', '--innodb_initialized']
      interval: 10s
      retries: 3
      start_period: 10s
    env_file:
      - .env.database.production.local
    volumes:
      - ticketer_database_data:/var/lib/mysql
    networks:
      - ticketer_database_network

  bot:
    image: ghcr.io/carelessinternet/ticketer-bot:latest
    container_name: ticketer-bot
    restart: unless-stopped
    # Change the platform to the one on your linux environment (amd64, arm64) if necessary.
    # platform: linux/arm64
    depends_on:
      database:
        condition: service_healthy
    env_file:
      - .env.bot.production.local
      - .env.database.production.local
    networks:
      - ticketer_database_network

  # Uncomment the service below if you want to self-host the website.
  # The website is exposed on port 2027.
  # website:
    # image: ghcr.io/carelessinternet/ticketer-website:latest
    # container_name: ticketer-website
    # restart: unless-stopped

volumes:
  ticketer_database_data:

networks:
  ticketer_database_network:
`.trim();

const botEnvironmentTemplate = `
NODE_ENV="production"
DISCORD_APPLICATION_ID=""
DISCORD_BOT_TOKEN=""
DISCORD_GUILD_ID=""
DISCORD_OWNER_ID=""
`.trim();

const databaseEnvironmentTemplate = `
DB_HOST="ticketer-database"
DB_DATABASE="Ticketer"
DB_PORT=3306
DB_USER=""
DB_PASSWORD=""
MARIADB_DATABASE=\${DB_DATABASE}
MYSQL_TCP_PORT=\${DB_PORT}
MARIADB_USER=\${DB_USER}
MARIADB_PASSWORD=\${DB_PASSWORD}
MARIADB_RANDOM_ROOT_PASSWORD=true
`.trim();

export async function generateMetadata({ params }: PageProps<'/[locale]/docs/self-hosting'>): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({
		locale: locale as Locale,
		namespace: 'layout.navbar.navigation.documentation.routes.self-hosting',
	});

	return mergeMetadata({ description: t('description'), locale, title: t('title') });
}

export default async function Page({ params }: PageProps<'/[locale]/docs/self-hosting'>) {
	const { locale } = await params;

	setRequestLocale(locale as Locale);

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
				<Code title="compose.yaml" lang="yaml" theme="github-dark">
					{composeFile}
				</Code>
				{/* todo: write why dockerfile has build to dockerfile URL
				see https://github.com/vercel/next.js/discussions/17641
				 */}
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
				<Code title=".env.bot.production.local" lang="dotenv" theme="github-dark">
					{botEnvironmentTemplate}
				</Code>
				<Paragraph>
					<RichText>{(tags) => t.rich('content.environment-variables.paragraphs.2', tags)}</RichText>
				</Paragraph>
				<CodeBlock clipboardText="nano .env.database.production.local">
					<span>
						<span className="text-green-500">nano </span>
						<span>.env.database.production.local</span>
					</span>
				</CodeBlock>
				<Code title=".env.database.production.local" lang="dotenv" theme="github-dark">
					{databaseEnvironmentTemplate}
				</Code>
			</Divider>
			<Divider>
				<ScrollLink target="running-the-bot">{t('content.running-the-bot.title')}</ScrollLink>
				<Paragraph>{t('content.running-the-bot.paragraphs.1')}</Paragraph>
				<CodeBlock clipboardText="docker compose up -d">
					<span>
						<span className="text-green-500">docker </span>
						<span>compose up -d</span>
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
				<CodeBlock clipboardText="docker compose down">
					<span>
						<span className="text-green-500">docker </span>
						<span>compose down</span>
					</span>
				</CodeBlock>
				<Paragraph>{t('content.running-the-bot.paragraphs.5')}</Paragraph>
				<CodeBlock clipboardText="docker compose pull">
					<span>
						<span className="text-green-500">docker </span>
						<span>compose pull</span>
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
