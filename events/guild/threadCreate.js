function onCreate(client, Discord, prefix, thread) {
  // delete the system message that shows "bla bla bla started a thread"
  try {
    const {guild, parent} = thread;
    if (guild.me.permissions.has('MANAGE_MESSAGES') && parent.lastMessage.system && parent.name === 'support') parent.lastMessage.delete();
  } catch(err) {
    console.error(err);
  }
}

module.exports = onCreate;