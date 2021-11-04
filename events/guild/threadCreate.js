const connection = require('../../db');

function ifExists(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [guildId]);
      resolve(rows[0] ?? false);
    } catch(err) {
      reject(err);
    }
  });
}

async function onCreate(client, Discord, prefix, thread) {
  // delete the system message that shows "bla bla bla started a thread"
  try {
    const {guild, guildId, parent} = thread;
    const {lastMessage, name} = parent;

    const record = await ifExists(guildId);
    
    if (thread.permissionsFor(guild.me).has('MANAGE_MESSAGES') && lastMessage.system && lastMessage.author.id === client.user.id) {
      if (record && record['SupportChannel'] === parent.id) {
        lastMessage.delete();
      } else if (name.toLowerCase() === 'support') {
        lastMessage.delete();
      } else {
        return;
      }
    }
  } catch(err) {
    console.error(err);
  }
}

module.exports = onCreate;