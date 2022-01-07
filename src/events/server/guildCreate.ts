import { Constants, type Guild, MessageEmbed } from 'discord.js';
import { hyperlink, inlineCode } from '@discordjs/builders';
import { version } from '../../../package.json';
import { links } from '../../utils';
import type { Event } from '../../types';

const event: Event = {
	name: Constants.Events.GUILD_CREATE,
	execute: (client, guild: Guild) => {
		if (!guild.systemChannel) return;
		if (!guild.systemChannel.permissionsFor(guild.me!).has(['SEND_MESSAGES']))
			return;

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Hello!')
			.setDescription(
				`Thank you for inviting me! To view all of the commands, use ${inlineCode(
					'/help'
				)}`
			)
			.addField(
				'Support Server',
				`For questions, suggestions, bug reports, or anything, join the ${hyperlink(
					'support server',
					links.support
				)}`
			)
			.addField(
				'Invite Link',
				`Invite ${hyperlink(
					'the bot',
					links.inviteLink(client)
				)} to another server!`
			)
			.addField(
				'Getting Started',
				`Use the command ${inlineCode(
					'/getting-started'
				)} for information about getting started`
			)
			.setTimestamp()
			.setFooter({ text: `Version ${version}` });

		guild.systemChannel.send({ embeds: [embed] }).catch(console.error);
	}
};

export default event;
