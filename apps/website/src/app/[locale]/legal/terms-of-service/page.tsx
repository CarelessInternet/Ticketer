import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Divider from '@/components/Divider';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';
import Title from '@/components/Title';
import { mergeMetadata } from '@/lib/mergeMetadata';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({ params }: PageProps<'/[locale]/legal/terms-of-service'>): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({
		locale: locale as Locale,
		namespace: 'layout.navbar.navigation.legal.routes.terms-of-service',
	});

	return mergeMetadata({ description: t('description'), locale, title: t('title') });
}

export default async function Page({ params }: PageProps<'/[locale]/legal/terms-of-service'>) {
	const { locale } = await params;

	setRequestLocale(locale as Locale);

	const t = await getTranslations('pages.legal.terms-of-service');

	return (
		<>
			<Divider>
				<Title>{t('heading.title')}</Title>
				<Paragraph>{t('heading.description', { lastUpdated: formatDate(new Date('2025-01-10')) })}</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="who-can-use-the-service">{t('sections.who-can-use-the-service.title')}</ScrollLink>
				<Paragraph>{t('sections.who-can-use-the-service.description')}</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="content">{t('sections.content.title')}</ScrollLink>
				<Paragraph>{t('sections.content.description')}</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="termination">{t('sections.termination.title')}</ScrollLink>
				<Paragraph>{t('sections.termination.description')}</Paragraph>
			</Divider>
		</>
	);
}
