const connection = require('../../db');

function ifGuildMemberEventExists(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM GuildMemberEvent WHERE GuildID = ?', [guildId]);
      resolve(rows[0] ?? false);
    } catch(err) {
      reject(err);
    }
  });
}
function ifTicketingManagersExists(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [guildId]);
      resolve(rows[0] ?? false);
    } catch(err) {
      reject(err);
    }
  });
}

async function onDelete(client, Discord, prefix, channel) {
  if (channel.type !== 'GUILD_TEXT') return;

  try {
    const memberRecord = await ifGuildMemberEventExists(channel.guildId);
    const managersRecord = await ifTicketingManagersExists(channel.guildId);
    
    if (memberRecord) {
      const {ChannelID} = memberRecord;
      if (ChannelID === channel.id) {
        connection.execute("UPDATE GuildMemberEvent SET ChannelID = 0 WHERE GuildID = ?", [channel.guildId]);
      }
    }
    if (managersRecord) {
      const {SupportChannel, LogsChannel} = managersRecord;

      if (SupportChannel === channel.id) {
        connection.execute("UPDATE TicketingManagers SET SupportChannel = 0 WHERE GuildID = ?", [channel.guildId]);
      }
      if (LogsChannel === channel.id) {
        connection.execute("UPDATE TicketingManagers SET LogsChannel = 0 WHERE GuildID = ?", [channel.guildId]);
      }
    }
  } catch(err) {
    console.error(err);
  }
}

module.exports = onDelete;