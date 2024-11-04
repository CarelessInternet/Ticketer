// eslint-disable-next-line no-restricted-imports
import { redirect } from 'next/navigation';

export default function Page() {
	redirect(
		'https://discord.com/oauth2/authorize?client_id=880454049370083329&permissions=395137198096&integration_type=0&scope=applications.commands+bot',
	);
}
