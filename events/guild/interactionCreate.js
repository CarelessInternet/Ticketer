function interaction(client, Discord, prefix, interaction) {
  if (!interaction.isCommand() && !interaction.isContextMenu()) return;
  if (!interaction.inGuild()) return interaction.reply({content: 'The commands for me are only available in a server.'});

  const cmd = interaction.commandName.toLowerCase();
  const command = client.commands.get(cmd) || client.commands.find(file => file.aliases?.includes(cmd));

  if (!command) return;

  command.execute(interaction, cmd, prefix);
}

module.exports = interaction;