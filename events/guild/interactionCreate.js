const {readdirSync} = require('fs');
const cooldowns = new Map();

function interaction(client, Discord, prefix, interaction) {
  if (!interaction.isCommand() && !interaction.isContextMenu()) return;
  if (!interaction.inGuild()) return interaction.reply({content: 'The commands for me are only available in a server.'});

  const cmd = interaction.commandName.toLowerCase();
  const command = client.commands.get(cmd) || client.commands.find(file => file.aliases?.includes(cmd));
  if (!command) return;

  const hasCooldown = cooldown(interaction, cmd, Discord.Collection);
  if (hasCooldown) return interaction.reply({content: hasCooldown, ephemeral: true});

  command.execute(interaction, cmd, prefix);
}
function cooldown(interaction, cmd, Collection) {
  if (!cooldowns.has(cmd)) cooldowns.set(cmd, new Collection());

  const [currentTime, timestamps] = [Date.now(), cooldowns.get(cmd)];
  const files = readdirSync('./commands/').filter(file => file.endsWith('.js')).map(name => name.slice(0, -3));
  const {data} = require(`../../commands/${files.find(name => name === cmd)}`);
  const amount = (data.cooldown || 3) * 1000;
  const key = interaction.user.id + interaction.guildId;

  if (timestamps.has(key)) {
    const expirationTime = timestamps.get(key) + amount;
    if (currentTime < expirationTime) {
      const timeLeft = ((expirationTime - currentTime) / 1000).toFixed(1);
      return `Please wait ${timeLeft} more ${timeLeft === 1 ? 'second' : 'seconds'} before using the ${cmd} command`;
    }
  }

  timestamps.set(key, currentTime);
  setTimeout(() => timestamps.delete(key), amount);
}

module.exports = interaction;