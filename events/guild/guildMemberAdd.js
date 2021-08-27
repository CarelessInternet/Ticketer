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

async function memberAdd(client, Discord, prefix, member) {
  try {
    const record = await ifExists(member.guild.id);
    if (!record) return;

    const {ChannelID, Enabled} = record;
    if (!Enabled) return;

    const channel = await member.guild.channels.fetch(ChannelID);
    const embed = new Discord.MessageEmbed()
    .setColor('DARK_GREEN')
    .setTitle(`Welcome ${member.user.tag}`)
    .setDescription(`<@${member.id}> Thank you for joining ${member.guild.name}! Enjoy your stay here!`)
    .addField('Account Creation', dateFormat(member.user.createdAt, 'yyyy-mm-dd HH:MM:ss'))
    .setThumbnail(member.user.avatarURL())
    .setTimestamp();

    channel.send({embeds: [embed]});
  } catch(err) {
    console.error(err);
  }
}

module.exports = memberAdd;