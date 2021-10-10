const { readFileSync } = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: {
		name: 'invite',
		description: 'Sends the invite link for the bot',
		category: 'utility',
		options: [],
		examples: ['invite']
	},
	execute(interaction) {
		const file = readFileSync('./info/invitelink.txt', 'utf8');
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Invite Link')
			.setDescription(file)
			.setTimestamp();

		interaction.reply({ embeds: [embed] }).catch(console.error);
	}
};
