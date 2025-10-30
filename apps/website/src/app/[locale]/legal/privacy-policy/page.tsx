import { getTranslations, setRequestLocale } from 'next-intl/server';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import type { Locale } from 'next-intl';
import type { Metadata } from 'next';
import Paragraph from '@/components/Paragraph';
import type { PropsWithChildren } from 'react';
import RichText from '@/components/RichText';
import ScrollLink from '@/components/ScrollLink';
import SectionDivider from '@/components/SectionDivider';
import Title from '@/components/Title';
import { formatDate } from '@/lib/utils';
import { mergeMetadata } from '@/lib/mergeMetadata';

function List({ children }: PropsWithChildren) {
	return <ul className="list-disc pb-4 pl-10 font-medium">{children}</ul>;
}

export async function generateMetadata({ params }: PageProps<'/[locale]/legal/privacy-policy'>): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({
		locale: locale as Locale,
		namespace: 'layout.navbar.navigation.legal.routes.privacy-policy',
	});

	return mergeMetadata({ description: t('description'), locale, title: t('title') });
}

export default async function Page({ params }: PageProps<'/[locale]/legal/privacy-policy'>) {
	const { locale } = await params;

	setRequestLocale(locale as Locale);

	const t = await getTranslations('pages.legal.privacy-policy');

	return (
		<>
			<Divider>
				<Title>{t('heading.title')}</Title>
				<Paragraph>{t('heading.description', { lastUpdated: formatDate(new Date('2024-11-04')) })}</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="website">{t('sections.website.title')}</ScrollLink>
				<SectionDivider header={t('sections.website.sections.1.title')}>
					<Paragraph>{t('sections.website.sections.1.description')}</Paragraph>
					<List>
						<li>
							<ExternalLink href="https://vercel.com/docs/analytics/privacy-policy#data-point-information">
								{t('sections.website.sections.1.list.1')}
							</ExternalLink>
						</li>
						<li>
							<ExternalLink href="https://vercel.com/docs/analytics/privacy-policy#data-point-information">
								{t('sections.website.sections.1.list.2')}
							</ExternalLink>
						</li>
						<li>
							<ExternalLink href="https://vercel.com/docs/analytics/privacy-policy#data-point-information">
								{t('sections.website.sections.1.list.3')}
							</ExternalLink>
						</li>
						<li>
							<ExternalLink href="https://vercel.com/docs/analytics/privacy-policy#data-point-information">
								{t('sections.website.sections.1.list.4')}
							</ExternalLink>
						</li>
					</List>
				</SectionDivider>
				<SectionDivider header={t('sections.website.sections.2.title')}>
					<Paragraph>
						<RichText>
							{(tags) =>
								t.rich('sections.website.sections.2.description', {
									linkVercelWebAnalytics: (chunk) => (
										<ExternalLink href="https://vercel.com/docs/analytics#how-visitors-are-determined">
											{chunk}
										</ExternalLink>
									),
									...tags,
								})
							}
						</RichText>
					</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.website.sections.3.title')}>
					<Paragraph>{t('sections.website.sections.3.description')}</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.website.sections.4.title')}>
					<Paragraph>
						<RichText>
							{(tags) =>
								t.rich('sections.website.sections.4.description', {
									linkVercel: (chunk) => <ExternalLink href="https://vercel.com">{chunk}</ExternalLink>,
									...tags,
								})
							}
						</RichText>
					</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.website.sections.5.title')}>
					<Paragraph>
						<RichText>{(tags) => t.rich('sections.website.sections.5.description', tags)}</RichText>
					</Paragraph>
				</SectionDivider>
			</Divider>
			<Divider>
				<ScrollLink target="discord">{t('sections.discord-bot.title')}</ScrollLink>
				<SectionDivider header={t('sections.discord-bot.sections.1.title')}>
					<Paragraph>
						<RichText>
							{(tags) =>
								t.rich('sections.discord-bot.sections.1.description', {
									linkDiscordPP: (chunk) => (
										<ExternalLink href="https://github.com/discord/discord-api-docs/blob/62c9a95b56d2f989d3eefe39a058d69189f6b4a6/docs/policies_and_agreements/Developer_Policy.md">
											{chunk}
										</ExternalLink>
									),
									...tags,
								})
							}
						</RichText>
						<span className="my-4 flex max-w-fit flex-row gap-2 border-l-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
							-
							<span className="text-xl leading-relaxed font-medium text-gray-900 italic dark:text-white">
								{t('sections.discord-bot.sections.1.quote')}
							</span>
						</span>
					</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.discord-bot.sections.2.title')}>
					<Paragraph>{t('sections.discord-bot.sections.2.paragraphs.1.text')}</Paragraph>
					<List>
						<li>{t('sections.discord-bot.sections.2.paragraphs.1.list.1')}</li>
						<li>{t('sections.discord-bot.sections.2.paragraphs.1.list.2')}</li>
						<li>{t('sections.discord-bot.sections.2.paragraphs.1.list.3')}</li>
					</List>
					<Paragraph>{t('sections.discord-bot.sections.2.paragraphs.2.text')}</Paragraph>
					<List>
						<li>{t('sections.discord-bot.sections.2.paragraphs.2.list.1')}</li>
					</List>
				</SectionDivider>
				<SectionDivider header={t('sections.discord-bot.sections.3.title')}>
					<Paragraph>{t('sections.discord-bot.sections.3.description')}</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.discord-bot.sections.4.title')}>
					<Paragraph>{t('sections.discord-bot.sections.4.description')}</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.discord-bot.sections.5.title')}>
					<Paragraph>{t('sections.discord-bot.sections.5.description')}</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.discord-bot.sections.6.title')}>
					<Paragraph>{t('sections.discord-bot.sections.6.description')}</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.discord-bot.sections.7.title')}>
					<Paragraph>
						<RichText>{(tags) => t.rich('sections.discord-bot.sections.7.description', tags)}</RichText>
					</Paragraph>
				</SectionDivider>
				<SectionDivider header={t('sections.discord-bot.sections.8.title')}>
					<Paragraph>{t('sections.discord-bot.sections.8.description')}</Paragraph>
				</SectionDivider>
			</Divider>
		</>
	);
}
