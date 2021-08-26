const {readdirSync} = require('fs');

function handler(client, Discord) {
  const files = readdirSync('./commands/').filter(file => file.endsWith('.js'));
  files.forEach(file => {
    const command = require(`../commands/${file}`);
    if (command.name) client.commands.set(command.name, command);
  });
}

module.exports = handler;