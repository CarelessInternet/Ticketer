import { getTranslations, setRequestLocale } from 'next-intl/server';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import Image from '@/components/Image';
import type { Metadata } from 'next';
import type { PageProperties } from '@/i18n/routing';
import Paragraph from '@/components/Paragraph';
import RichText from '@/components/RichText';
import ScrollLink from '@/components/ScrollLink';
import Title from '@/components/Title';

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({
		locale,
		namespace: 'layout.navbar.navigation.documentation.routes.contributing-to-localisation',
	});

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('title'),
			description: t('description'),
		},
	};
}

export default async function Page({ params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations('pages.docs.contributing-to-localisation');

	return (
		<>
			<Divider>
				<Title>{t('title')}</Title>
				<Paragraph>
					<RichText>
						{(tags) =>
							t.rich('description', {
								linkVSCode: (chunk) => <ExternalLink href="https://code.visualstudio.com">{chunk}</ExternalLink>,
								...tags,
							})
						}
					</RichText>
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="prerequisites-before-contributing">
					{t('sections.prerequisites-before-contributing.title')}
				</ScrollLink>
				<Paragraph>{t('sections.prerequisites-before-contributing.description')}</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="what-locales-can-be-supported">
					{t('sections.what-locales-can-be-supported.title')}
				</ScrollLink>
				<Paragraph>
					<RichText>
						{(tags) =>
							t.rich('sections.what-locales-can-be-supported.description', {
								linkDiscordReference: (chunk) => (
									<ExternalLink href="https://discord.com/developers/docs/reference#locales">{chunk}</ExternalLink>
								),
								...tags,
							})
						}
					</RichText>
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="getting-started-bot">{t('sections.getting-started-bot.title')}</ScrollLink>
				<Paragraph>
					<RichText>{(tags) => t.rich('sections.getting-started-bot.paragraphs.1', tags)}</RichText>
				</Paragraph>
				<Image
					src="/images/localisation-example-folder.png"
					alt={t('sections.getting-started-bot.imageAlts.1')}
					width={384}
					height={216}
				/>
				<Paragraph>{t('sections.getting-started-bot.paragraphs.2')}</Paragraph>
				<Image
					src="/images/localisation-i18n-npm-script.png"
					alt={t('sections.getting-started-bot.imageAlts.2')}
					width={384}
					height={216}
				/>
				<Paragraph>{t('sections.getting-started-bot.paragraphs.3')}</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="getting-started-website">{t('sections.getting-started-website.title')}</ScrollLink>
				<Paragraph>
					<RichText>{(tags) => t.rich('sections.getting-started-website.description', tags)}</RichText>
				</Paragraph>
			</Divider>
		</>
	);
}
