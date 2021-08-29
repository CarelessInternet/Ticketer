const {MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "bot-stats",
    description: "Returns info about the bot's stats",
    category: "utility",
    options: [],
    examples: [
      "bot-stats"
    ]
  },
  async execute(interaction) {
    try {
      const {shard} = interaction.client;
      const promises = [
        shard.fetchClientValues('guilds.cache.size'),
        shard.fetchClientValues('emojis.cache.size'),
        shard.fetchClientValues('channels.cache.size'),
        shard.fetchClientValues('users.cache.size'),
        shard.broadcastEval(c => c.guilds.cache.reduce((acc, curr) => acc + curr.memberCount, 0))
      ];

      const [guildSize, emojiSize, channelSize, userSize, memberSize] = await Promise.all(promises);
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle('Bot Stats')
      .setDescription('Shows info about the bot\'s stats')
      .addField('Servers', '📊 ' + guildSize.reduce((acc, curr) => acc + curr, 0), true)
      .addField('Server Members', '👥 ' + memberSize.reduce((acc, curr) => acc + curr, 0), true)
      .addField('Cached Users', '👤 ' + userSize.reduce((acc, curr) => acc + curr, 0), true)
      .addField('\u200B', '\u200B')
      .addField('Channels', '📺 ' + channelSize.reduce((acc, curr) => acc + curr, 0), true)
      .addField('Emojis', '💩 ' + emojiSize.reduce((acc, curr) => acc + curr, 0), true)
      .setTimestamp();

      interaction.reply({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured whilst fetching data, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}