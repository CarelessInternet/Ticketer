import { redirect } from '@/i18n/routing';

export default function Page() {
	redirect({
		href: 'https://discord.com/oauth2/authorize?client_id=880454049370083329&permissions=395137198096&integration_type=0&scope=applications.commands+bot',
		locale: 'does not matter',
	});
}
