function onCreate(client, Discord, prefix, thread) {
  // delete the system message that shows "bla bla bla started a thread"
  try {
    const {guild, parent} = thread;
    const {lastMessage, name} = parent;
    if (guild.me.permissions.has('MANAGE_MESSAGES') && lastMessage.system && lastMessage.author.id === client.user.id && name.toLowerCase() === 'support') lastMessage.delete();
  } catch(err) {
    console.error(err);
  }
}

module.exports = onCreate;