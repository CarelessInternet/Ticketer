const {version} = require('../package.json');
const {readFileSync} = require('fs');
const {MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "getting-started",
    description: "Shows how to get started with using the bot",
    category: "staff",
    options: [],
    examples: [
      "getting-started"
    ]
  },
  execute(interaction) {
    try {
      if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({content: 'You need the manage server permission to use this command', ephemeral: true});
      
      const startingFile = readFileSync('./info/gettingstarted.txt', 'utf8');
      const inviteFile = readFileSync('./info/invitelink.txt', 'utf8');
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({dynamic: true}))
      .setTitle('Getting Started')
      .setDescription(inviteFile)
      .addField('Steps', startingFile)
      .setTimestamp()
      .setFooter(`Version ${version}`);

      interaction.reply({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true});
    }
  }
}