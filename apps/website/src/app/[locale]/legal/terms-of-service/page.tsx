import { getTranslations, setRequestLocale } from 'next-intl/server';
import Divider from '@/components/Divider';
import type { Metadata } from 'next';
import type { PageProperties } from '@/i18n/routing';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';
import Title from '@/components/Title';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'layout.navbar.navigation.legal.routes.terms-of-service' });

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

	const t = await getTranslations('pages.legal.terms-of-service');

	return (
		<>
			<Divider>
				<Title>{t('heading.title')}</Title>
				<Paragraph>{t('heading.description', { lastUpdated: formatDate(new Date('2024-11-04')) })}</Paragraph>
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
