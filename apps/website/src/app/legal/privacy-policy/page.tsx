import ExternalLink from '@/components/ExternalLink';
import Paragraph from '@/components/Paragraph';
import type { PropsWithChildren } from 'react';
import ScrollLink from '@/components/ScrollLink';

function Divider({ children }: PropsWithChildren) {
	return <div className="space-y-2">{children}</div>;
}

function Header({ children }: PropsWithChildren) {
	return <h3 className="text-lg font-bold sm:text-xl">{children}</h3>;
}

function SectionDivider({ children, header }: PropsWithChildren<{ header: string }>) {
	return (
		<div className="pt-2">
			<Divider>
				<Header>{header}</Header>
				{children}
			</Divider>
		</div>
	);
}

function List({ children }: PropsWithChildren) {
	return <ul className="m-auto list-disc pl-10 font-medium">{children}</ul>;
}

export default function Page() {
	return (
		<div className="flex flex-col space-y-12 pt-4">
			<Divider>
				<h1 className="text-3xl font-bold sm:text-4xl">Ticketer Privacy Policy</h1>
				<Paragraph>This page was last updated on 2024-02-08.</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="website">Website</ScrollLink>
				<SectionDivider header="What user information is collected?">
					<Paragraph>The anonymous user information collected by the Ticketer website is the following:</Paragraph>
					<List>
						<li>
							<ExternalLink href="https://vercel.com/docs/analytics/privacy-policy#data-point-information">
								Geolocation
							</ExternalLink>
						</li>
						<li>
							<ExternalLink href="https://vercel.com/docs/analytics/privacy-policy#data-point-information">
								Device OS & Version
							</ExternalLink>
						</li>
						<li>
							<ExternalLink href="https://vercel.com/docs/analytics/privacy-policy#data-point-information">
								Browser & Version
							</ExternalLink>
						</li>
						<li>
							<ExternalLink href="https://vercel.com/docs/analytics/privacy-policy#data-point-information">
								Device Type
							</ExternalLink>
						</li>
					</List>
				</SectionDivider>
				<SectionDivider header="How is the user information collected?">
					<Paragraph>
						According to{' '}
						<ExternalLink href="https://vercel.com/docs/analytics#how-visitors-are-determined">
							Vercel Web Analytics
						</ExternalLink>
						, the visitors are identified by a hash created from the incoming request. Cookies are not used to track
						users. Page views are tracked through the native Browser API.
					</Paragraph>
				</SectionDivider>
				<SectionDivider header="How is the personal information used?">
					<Paragraph>
						The data collected is used for analytical purposes and may be used to improve the user experience.
					</Paragraph>
				</SectionDivider>
				<SectionDivider header="Is the personal information shared?">
					<Paragraph>
						This information is sent to <ExternalLink href="https://vercel.com">Vercel</ExternalLink> to provide the
						analytical data.
					</Paragraph>
				</SectionDivider>
				<SectionDivider header="How can I contact for questions or concerns?">
					<Paragraph>
						You may join the official{' '}
						<ExternalLink href="https://discord.gg/9FHagm6343">Discord support server</ExternalLink> to ask questions or
						raise concerns regarding Ticketer.
					</Paragraph>
				</SectionDivider>
			</Divider>
			<Divider>
				<ScrollLink target="discord">Discord</ScrollLink>
				<SectionDivider header='What do you mean by "Discord Data?"'>
					<Paragraph>
						From the old{' '}
						<ExternalLink href="https://github.com/discord/discord-api-docs/blob/62c9a95b56d2f989d3eefe39a058d69189f6b4a6/docs/policies_and_agreements/Developer_Policy.md">
							Discord Developer Privacy Policy
						</ExternalLink>
						:{/* https://dev.to/themesberg/how-to-build-a-blockquote-component-in-tailwind-css-25cf */}
						<span className="my-4 flex max-w-fit flex-row gap-2 border-l-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
							-
							<span className="text-xl font-medium italic leading-relaxed text-gray-900 dark:text-white">
								“Discord Data” means any and all data you obtain through the APIs.
							</span>
						</span>
					</Paragraph>
				</SectionDivider>
				<SectionDivider header="What Discord Data do you store?">
					<Paragraph>
						The Ticketer bot may store the following relevant data from Discord when prompted through an application
						command by a user:
					</Paragraph>
					<List>
						<li>Guild, Channel, Role, and User IDs </li>
						<li>Message Content from Modals</li>
						<li>Data Passed Through Command Options</li>
					</List>
					<Paragraph>In addition, Ticketer may store data not prompted through commands, such as:</Paragraph>
					<List>
						<li>Thread&apos;s State</li>
					</List>
				</SectionDivider>
				<SectionDivider header="Why do you need the data?">
					<Paragraph>
						All of the data collected by Ticketer is necessary to keep the application running and functioning as
						expected.
					</Paragraph>
				</SectionDivider>
				<SectionDivider header="How do you use the data?">
					<Paragraph>
						The information is used to provide a quality user experience in a Discord server, such as creating support
						tickets, automatically sending a message on thread creation, or automatically creating a thread under a
						message.
					</Paragraph>
				</SectionDivider>
				<SectionDivider header="How long is the data stored for?">
					<Paragraph>
						The majority of the data is stored permanently. The exception is for thread tickets, where they
						automatically get deleted when the thread is deleted.
					</Paragraph>
				</SectionDivider>
				<SectionDivider header="Do you share the Discord Data to companies or people?">
					<Paragraph>No.</Paragraph>
				</SectionDivider>
				<SectionDivider header="How can users contact you if they have concerns about your bot?">
					<Paragraph>
						They may join the official{' '}
						<ExternalLink href="https://discord.gg/9FHagm6343">support server on Discord</ExternalLink> or open an
						issue/discussion on the Ticketer GitHub page.
					</Paragraph>
				</SectionDivider>
				<SectionDivider header="How can users have the data removed?">
					<Paragraph>They may do the following above.</Paragraph>
				</SectionDivider>
			</Divider>
		</div>
	);
}
