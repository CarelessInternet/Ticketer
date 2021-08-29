const {MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "ping",
    description: "Responds with the ping and latency",
    category: "utility",
    options: [],
    examples: [
      "ping"
    ]
  },
  async execute(interaction) {
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setTitle('Pinging...')
    .setTimestamp();

    try {
      const message = await interaction.reply({embeds: [embed], fetchReply: true});
  
      embed.setTitle('Result:');
      embed.addFields({
        name: 'Ping',
        value: `⌛ ${interaction.client.ws.ping}ms`
      }, {
        name: 'Latency',
        value: `🏓 Roughly ${message.createdTimestamp - interaction.createdTimestamp}ms`
      });

      message.edit({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.followUp({content: 'An error occured while pinging, please try again later', ephemeral: true});
    }
  }
}