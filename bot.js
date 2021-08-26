const Discord = require('discord.js');
const flags = Discord.Intents.FLAGS;
const client = new Discord.Client({
  intents: [flags.GUILDS, flags.GUILD_MESSAGES, flags.GUILD_MESSAGE_REACTIONS, flags.GUILD_BANS, flags.DIRECT_MESSAGES],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  shards: 'auto'
});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => require(`./handlers/${handler}`)(client, Discord));

client.login(process.env.token);