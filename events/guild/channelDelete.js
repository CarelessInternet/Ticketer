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

async function onDelete(client, Discord, prefix, channel) {
  if (channel.type !== 'GUILD_TEXT') return;
  try {
    const record = await ifExists(channel.guildId);
    if (!record) return;

    const {ChannelID} = record;
    if (ChannelID !== channel.id) return;

    connection.execute("UPDATE GuildMemberEvent SET ChannelID = 0 WHERE GuildID = ?", [channel.guildId]);
  } catch(err) {
    console.error(err);
  }
}

module.exports = onDelete;