import { getTranslations, setRequestLocale } from 'next-intl/server';
import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import type { Metadata } from 'next';
import type { PageProperties } from '@/i18n/routing';
import Paragraph from '@/components/Paragraph';
import RichText from '@/components/RichText';
import ScrollLink from '@/components/ScrollLink';
import Title from '@/components/Title';
import { mergeMetadata } from '@/lib/mergeMetadata';

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'layout.navbar.navigation.documentation.routes.development' });

	return mergeMetadata({ description: t('description'), locale, title: t('title') });
}

export default async function Page({ params }: PageProperties) {
	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations('pages.docs.development');

	return (
		<>
			<Divider>
				<Title>{t('title')}</Title>
				<Paragraph>
					<RichText>
						{(tags) =>
							t.rich('paragraphs.1', {
								linkVSCode: (chunk) => <ExternalLink href="https://code.visualstudio.com">{chunk}</ExternalLink>,
								linkDevContainers: (chunk) => <ExternalLink href="https://containers.dev">{chunk}</ExternalLink>,
								...tags,
							})
						}
					</RichText>
				</Paragraph>
				<Paragraph>
					<RichText>
						{(tags) =>
							t.rich('paragraphs.2', {
								linkDockerDesktop: (chunk) => (
									<ExternalLink href="https://www.docker.com/products/docker-desktop/">{chunk}</ExternalLink>
								),
								linkDockerEngine: (chunk) => (
									<ExternalLink href="https://docs.docker.com/engine/install/">{chunk}</ExternalLink>
								),
								...tags,
							})
						}
					</RichText>
				</Paragraph>
				<Paragraph>{t('paragraphs.3')}</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="setting-up">{t('sections.setting-up.title')}</ScrollLink>
				<Paragraph>{t('sections.setting-up.paragraphs.1')}</Paragraph>
				<CodeBlock clipboardText="Dev Containers: Clone Repository in Container Volume...">
					<span>Dev Containers: Clone Repository in Container Volume...</span>
				</CodeBlock>
				<Paragraph>{t('sections.setting-up.paragraphs.2')}</Paragraph>
				<CodeBlock clipboardText="https://github.com/CarelessInternet/Ticketer.git">
					<span>https://github.com/CarelessInternet/Ticketer.git</span>
				</CodeBlock>
				<Paragraph>{t('sections.setting-up.paragraphs.3')}</Paragraph>
			</Divider>
		</>
	);
}
