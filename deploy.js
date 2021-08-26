require('dotenv').config();

const {readdirSync} = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');

const rest = new REST({version: '9'}).setToken(process.env.token);
(async () => {
  try {
    console.log('Started refreshing application (/) commands');
    const files = readdirSync('./commands/').filter(file => file.endsWith('.js'));
    const commands = files.reduce((acc, file) => {
      acc.push(require(`./commands/${file}`).data);
      return acc;
    }, []);
    await rest.put(Routes.applicationCommands(process.env.clientID), {body: commands});

    console.log('Successfully reloaded application (/) commands');
  } catch(err) {
    console.error(err);
  }
})();