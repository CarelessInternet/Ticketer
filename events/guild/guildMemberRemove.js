const connection = require('../../db');

function ifExists(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM GuildMemberEvent WHERE GuildID = ?', [guildId]);
      resolve(rows[0] ?? false);
    } catch(err) {
      reject(err);
    }
  });
}

async function memberRemove(client, Discord, prefix, member) {
  try {
    if (member.id === client.user.id) return;
    
    const record = await ifExists(member.guild.id);
    if (!record) return;
    
    const {ChannelID, Enabled} = record;
    if (!Enabled || ChannelID === 0) return;

    const channel = await member.guild.channels.fetch(ChannelID);
    if (!channel.permissionsFor(member.guild.me).has('SEND_MESSAGES')) return;

    const embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`Bye ${member.user.tag}`)
    .setDescription(`<@${member.id}> has left the server.`)
    .addField('Account Creation Date', `<t:${Math.floor(member.user.createdTimestamp / 1000)}>`)
    .addField('Leave Date', `<t:${Math.floor(new Date().getTime() / 1000)}:R>`)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

    channel.send({embeds: [embed]});
  } catch(err) {
    console.error(err);
  }
}

module.exports = memberRemove;