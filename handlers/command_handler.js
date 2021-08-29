const {readdirSync} = require('fs');

function handler(client, Discord) {
  const files = readdirSync('./commands/').filter(file => file.endsWith('.js'));
  files.forEach(file => {
    const command = require(`../commands/${file}`);
    client.commands.set(command.data.name, command);
  });
}

module.exports = handler;