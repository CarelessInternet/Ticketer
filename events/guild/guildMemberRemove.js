const connection = require('../../db');
const dateFormat = require('dateformat');

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
    if (!member.guild.me.permissions.has('ADMINISTRATOR')) return;

    const record = await ifExists(member.guild.id);
    if (!record) return;

    const {ChannelID, Enabled} = record;
    if (!Enabled || ChannelID === 0) return;

    const channel = await member.guild.channels.fetch(ChannelID);
    const embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`Bye ${member.user.tag}`)
    .setDescription(`<@${member.id}> has left the server.`)
    .addField('Account Creation', dateFormat(member.user.createdAt, 'yyyy-mm-dd HH:MM:ss'))
    .setThumbnail(member.user.avatarURL())
    .setTimestamp();

    channel.send({embeds: [embed]});
  } catch(err) {
    console.error(err);
  }
}

module.exports = memberRemove;