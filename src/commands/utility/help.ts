import { hyperlink, inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { version } from '../../../package.json';
import { fetchCommands, links } from '../../utils';
import type { Command } from '../../types';

const command: Command = {
	category: 'Utility',
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows all available commands')
		.addBooleanOption((option) =>
			option
				.setName('hidden')
				.setDescription('Whether the message should be shown to you or everybody')
				.setRequired(false)
		),
	execute: async ({ client, interaction }) => {
		const commands = await fetchCommands();

		// returns a list of unique categories
		const categories = [...new Set(commands.map((command) => command.category))].reverse();

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true })
			})
			.setTitle('Command List')
			.setDescription('A list of all current available commands')
			.setTimestamp()
			.setFooter({ text: `Version ${version}` });

		for (const category of categories) {
			const commandsInCategory = commands.filter((command) => command.category === category);
			const fieldValue = commandsInCategory
				.reduce((acc: string[], curr) => {
					acc.push(inlineCode(`/${curr.data.name}`));
					return acc;
				}, [])
				.join(', ');

			embed.addField(`🛠️ ${category}`, fieldValue, true);
		}

		const linkArray: string[] = [
			hyperlink('Support Server', links.support),
			hyperlink('Invite Link', links.inviteLink(client)),
			hyperlink('Privacy Policy', links.privacyPolicy),
			hyperlink('ToS', links.termsOfService)
		];

		if (process.env.TOP_GG_TOKEN && process.env.NODE_ENV === 'production') {
			// it should specifically be at index 2
			linkArray.splice(2, 0, hyperlink('Vote for Me!', links.topGGVote));
		}

		const linksAsString = linkArray.join(' | ');
		embed.addField('🔗 Links', linksAsString);

		const ephemeral = interaction.options.getBoolean('hidden') ?? true;

		interaction.reply({ embeds: [embed], ephemeral }).catch(console.error);
	}
};

export default command;
