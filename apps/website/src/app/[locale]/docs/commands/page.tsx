import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CodeBlock from '@/components/CodeBlock';
import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import Image from '@/components/Image';
import Paragraph from '@/components/Paragraph';
import RichText from '@/components/RichText';
import ScrollLink from '@/components/ScrollLink';
import SectionDivider from '@/components/SectionDivider';
import Title from '@/components/Title';
import { mergeMetadata } from '@/lib/mergeMetadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/docs/commands'>): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({
		locale: locale as Locale,
		namespace: 'layout.navbar.navigation.documentation.routes.commands',
	});

	return mergeMetadata({ description: t('description'), locale, title: t('title') });
}

export default async function Page({ params }: PageProps<'/[locale]/docs/commands'>) {
	const { locale } = await params;

	setRequestLocale(locale as Locale);

	const t = await getTranslations('pages.docs.commands');

	return (
		<>
			<Divider>
				<Title>{t('heading.title')}</Title>
				<Paragraph>{t('heading.description')}</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="plans-and-progress">{t('content.plans-and-progress.title')}</ScrollLink>
				<Paragraph>
					<RichText>
						{(tags) =>
							t.rich('content.plans-and-progress.description', {
								linkAffine: (chunk) => (
									<ExternalLink href="https://affine.pyce.eu/workspace/eded79da-c8d2-4c33-ba05-1b28e5b21906/zzZig58uMWTD-uTDVmZbE">
										{chunk}
									</ExternalLink>
								),
								...tags,
							})
						}
					</RichText>
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="thread-tickets">{t('content.thread-tickets.title')}</ScrollLink>
				<Paragraph>{t('content.thread-tickets.description')}</Paragraph>
				<SectionDivider header={t('content.thread-tickets.sections.configuring-thread-tickets.title')}>
					<Paragraph>
						<RichText>
							{(tags) => t.rich('content.thread-tickets.sections.configuring-thread-tickets.paragraphs.1', tags)}
						</RichText>
					</Paragraph>
					<CodeBlock clipboardText="/configuration-ticket-threads global-settings active-tickets" slashCommand>
						<span>configuration-ticket-threads global-settings active-tickets</span>
					</CodeBlock>
					<Paragraph>{t('content.thread-tickets.sections.configuring-thread-tickets.paragraphs.2')}</Paragraph>
					<CodeBlock clipboardText="/configuration-ticket-threads categories create" slashCommand>
						<span>configuration-ticket-threads categories create</span>
					</CodeBlock>
					<Paragraph>{t('content.thread-tickets.sections.configuring-thread-tickets.paragraphs.3')}</Paragraph>
					<CodeBlock clipboardText="/configuration-ticket-threads categories edit" slashCommand>
						<span>configuration-ticket-threads categories edit</span>
					</CodeBlock>
					<Image
						src="/images/commands-thread-tickets-edit.png"
						alt={t('content.thread-tickets.sections.configuring-thread-tickets.imageAlts.1')}
						width={384}
						height={216}
					/>
				</SectionDivider>
				<SectionDivider header={t('content.thread-tickets.sections.creating-a-ticket.title')}>
					<Paragraph>{t('content.thread-tickets.sections.creating-a-ticket.paragraphs.1')}</Paragraph>
					<CodeBlock
						clipboardText={`/${t('content.thread-tickets.sections.creating-a-ticket.commands.1')}`}
						slashCommand
					>
						<span>{t('content.thread-tickets.sections.creating-a-ticket.commands.1')}</span>
					</CodeBlock>
					<Paragraph>{t('content.thread-tickets.sections.creating-a-ticket.paragraphs.2')}</Paragraph>
					<Image
						src="/images/thread-tickets-ticket.png"
						alt={t('content.thread-tickets.sections.creating-a-ticket.imageAlts.1')}
						width={720}
						height={405}
					/>
				</SectionDivider>
				<SectionDivider header={t('content.thread-tickets.sections.creating-a-panel.title')}>
					<Paragraph>{t('content.thread-tickets.sections.creating-a-panel.paragraphs.1')}</Paragraph>
					<CodeBlock clipboardText="/panel" slashCommand>
						<span>panel</span>
					</CodeBlock>
					<Image
						src="/images/commands-thread-tickets-panel.png"
						alt={t('content.thread-tickets.sections.creating-a-panel.imageAlts.1')}
						width={384}
						height={216}
					/>
				</SectionDivider>
				<SectionDivider header={t('content.thread-tickets.sections.ticket-actions.title')}>
					<Paragraph>{t('content.thread-tickets.sections.ticket-actions.paragraphs.1')}</Paragraph>
				</SectionDivider>
			</Divider>
			<Divider>
				<ScrollLink target="user-forums">{t('content.user-forums.title')}</ScrollLink>
				<Paragraph>{t('content.user-forums.description')}</Paragraph>
				<CodeBlock clipboardText="/configuration-user-forums create" slashCommand>
					<span>configuration-user-forums create</span>
				</CodeBlock>
				<Image src="/images/user-forums-message.png" alt={t('content.user-forums.imageAlt')} width={720} height={405} />
			</Divider>
			<Divider>
				<ScrollLink target="automatic-threads">{t('content.automatic-threads.title')}</ScrollLink>
				<Paragraph>{t('content.automatic-threads.description')}</Paragraph>
				<CodeBlock clipboardText="/configuration-automatic-threads create" slashCommand>
					<span>configuration-automatic-threads create</span>
				</CodeBlock>
				<Image
					src="/images/automatic-threads-thread.png"
					alt={t('content.automatic-threads.imageAlt')}
					width={720}
					height={405}
				/>
			</Divider>
			<Divider>
				<ScrollLink target="miscellaneous">{t('content.miscellaneous.title')}</ScrollLink>
				<SectionDivider header={t('content.miscellaneous.sections.moderation.title')}>
					<Paragraph>{t('content.miscellaneous.sections.moderation.paragraphs.1')}</Paragraph>
					<CodeBlock clipboardText={`/${t('content.miscellaneous.sections.moderation.commands.1')}`} slashCommand>
						<span>{t('content.miscellaneous.sections.moderation.commands.1')}</span>
					</CodeBlock>
				</SectionDivider>
				<SectionDivider header={t('content.miscellaneous.sections.member-permissions.title')}>
					<Paragraph>{t('content.miscellaneous.sections.member-permissions.paragraphs.1')}</Paragraph>
				</SectionDivider>
			</Divider>
		</>
	);
}
