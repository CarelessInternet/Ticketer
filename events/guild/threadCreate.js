function onCreate(client, Discord, prefix, thread) {
  // delete the system message that shows "bla bla bla started a thread"
  thread.parent.lastMessage.delete();
}

module.exports = onCreate;