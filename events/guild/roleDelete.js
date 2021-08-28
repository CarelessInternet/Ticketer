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

async function onDelete(client, Discord, prefix, role) {
  try {
    const record = await ifExists(role.guild.id);
    if (!record) return;
  
    const {RoleID} = record;
    if (RoleID !== role.id) return;
  
    connection.execute('UPDATE TicketingManagers SET RoleID = 0 WHERE GuildID = ?', [role.guild.id]);
  } catch(err) {
    console.error(err);
  }
}

module.exports = onDelete;