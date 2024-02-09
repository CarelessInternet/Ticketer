import Divider from '@/components/Divider';
import ExternalLink from '@/components/ExternalLink';
import Image from 'next/image';
import Paragraph from '@/components/Paragraph';
import ScrollLink from '@/components/ScrollLink';
import Title from '@/components/Title';

export default function Page() {
	return (
		<>
			<Divider>
				<Title>Contributing to Localisation</Title>
				<Paragraph>
					Since version 3, the Ticketer bot supports localisation depending on both the user&apos;s and server&apos;s
					locale. We welcome all localisation contributions! This page will explain how to add localisation files to the
					bot. This tutorial assumes you are using{' '}
					<ExternalLink href="https://code.visualstudio.com">Visual Studio Code</ExternalLink> to edit the files.
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="prerequisites-before-contributing">Prerequisites Before Contributing</ScrollLink>
				<Paragraph>
					This tutorial assumes you have knowledge of Git and creating pull requests if you wish to merge the changes
					into the Ticketer codebase. If you are looking to contribute to this project and do not have those skills yet,
					it is time to learn some basic Git and GitHub!
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="what-locales-are-supported">What locales are supported?</ScrollLink>
				<Paragraph>
					The locales that are supported can be found in the{' '}
					<ExternalLink href="https://discord.com/developers/docs/reference#locales">
						Discord Developers Documentation Reference
					</ExternalLink>
					.
				</Paragraph>
			</Divider>
			<Divider>
				<ScrollLink target="getting-started">Getting Started</ScrollLink>
				<Paragraph>
					To create a new locale, create a folder in the <i>/apps/bot/src/i18n</i> directory, with the folder name as
					one of the locales from the locale list, e.g. &quot;fr&quot;. Next, to make the process easier, copy each file
					from the &quot;sv-SE&quot; folder and paste them into your new localisation folder. The folder should look
					something like this afterwards:
				</Paragraph>
				<Image
					src="/localisation-example-folder.png"
					alt="Picture of an example localisation folder."
					width={384}
					height={216}
				/>
				<Paragraph>
					Then, you should run the &quot;i18n&quot; NPM script on the bottom left of your explorer. This will generate
					the types required, as well as type checking the files for any missing or invalid localisations.
				</Paragraph>
				<Image src="/localisation-i18n-npm-script.png" alt="Picture of the i18n npm script." width={384} height={216} />
				<Paragraph>
					Finally, you can start editing the files and add the correct translations for your locale of choice! If you
					need a reference for the translation, you can open the British English file variant and translate accordingly.
					Happy translating!
				</Paragraph>
			</Divider>
		</>
	);
}
