import Divider from '@/components/Divider';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';

export default function Page() {
	return (
		<>
			<Divider>
				<h1 className="text-3xl font-bold sm:text-4xl">Ticketer Terms of Service</h1>
				<Paragraph>This page was last updated on 2024-02-08.</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="who-can-use-the-service">Who can use the service?</ScrollLink>
				<Paragraph>
					By using Ticketer, you are agreeing to both the privacy policy and terms of service. The terms of service may
					be changed at any moment without notice. You are also agreeing that you are over 13 years old, or above the
					minimum age to use Discord in your country, whichever is higher.
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="content">Content</ScrollLink>
				<Paragraph>
					You are responsible for the content created by you in any stored data on Ticketer. Ticketer does not filter,
					verify, nor condone the content created by users.
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="termination">Termination</ScrollLink>
				<Paragraph>
					Ticketer reserves the right to delete data without warning, especially if a server is found to be violating
					including but not limited to: laws and terms of services. These actions are irreversible.
				</Paragraph>
			</Divider>
		</>
	);
}
