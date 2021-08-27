const {MessageEmbed} = require('discord.js');

module.exports = {
  name: 'server-stats',
  data: {
    name: "server-stats",
    description: "Returns stats about the current server",
    category: "utility",
    options: [],
    examples: [
      "server-stats"
    ],
  },
  execute(interaction) {
    try {
      const {guild} = interaction;
      const banCount = guild.bans.cache.size;
      const channelCount = guild.channels.channelCountWithoutThreads;
      const emojiCount = guild.emojis.cache.size;
      const roleCount = guild.roles.cache.size;
      const stickerCount = guild.stickers.cache.size;
      const boosts = guild.premiumSubscriptionCount;
      const {memberCount, name, partnered, verified} = guild;

      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle(`Stats of ${name}`)
      .setDescription('All interesting stats of the server')
      .addField('Member Count', memberCount.toLocaleString(), true)
      .addField('Channel Count', channelCount.toLocaleString(), true)
      .addField('Emoji Count', emojiCount.toLocaleString(), true)
      .addField('\u200B', '\u200B')
      .addField('Role Count', roleCount.toLocaleString(), true)
      .addField('Sticker Count', stickerCount.toLocaleString(), true)
      .addField('Boost Count', boosts.toLocaleString(), true)
      .addField('\u200B', '\u200B')
      .addField('Ban Count', banCount.toLocaleString(), true)
      .addField('Verified', verified ? 'True' : 'False', true)
      .addField('Partnered', partnered ? 'True' : 'False', true)
      .setImage(guild.iconURL({dynamic: true}))
      .setTimestamp();

      interaction.reply({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}