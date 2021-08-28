const {readFileSync} = require('fs');

function guildCreate(client, Discord, prefix, guild) {
  if (!guild.systemChannel || !guild.me.permissions.has('ADMINISTRATOR')) return;

  const inviteField = readFileSync('./info/invitelink.txt', 'utf8');
  const supportField = readFileSync('./info/support.txt', 'utf8');
  const startingField = readFileSync('./info/gettingstarted.txt', 'utf8');
  const embed = new Discord.MessageEmbed()
  .setColor('RANDOM')
  .setTitle('Hello!')
  .setDescription(`Thank you for inviting me!\nTo view all of the commands, please use \`${prefix}help\``)
  .addField('Support Server', supportField)
  .addField('Invite Link', inviteField)
  .addField('Getting Started', startingField)
  .setTimestamp();

  guild.systemChannel.send({embeds: [embed]}).catch(console.error);
}

module.exports = guildCreate;