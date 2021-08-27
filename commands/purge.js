module.exports = {
  name: 'purge',
  data: {
    name: "purge",
    description: "Deletes the latest messages by a specified amount",
    category: "staff",
    options: [
      {
        name: "amount",
        description: "The amount of messages to delete",
        type: 4,
        required: true
      }
    ],
    examples: [
      "purge 5",
      "purge 15",
      "purge 50",
      "purge 200"
    ]
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'You need the manage messages permission to run this command', ephemeral: true}).catch(console.error);
    if (!interaction.guild.me.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'I need the manage messages permission to run this command', ephemeral: true}).catch(console.error);

    try {
      const amount = interaction.options.getInteger('amount');
      if (amount < 1 || amount > 100) return interaction.reply({content: 'Amount must be between 1 and 100', ephemeral: true});

      const deleted = await interaction.channel.bulkDelete(amount);
      interaction.reply({content: `👍 Successfully deleted the last ${deleted.size} ${deleted.size === 1 ? 'message' : 'messages'}`});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured whilst purging messages, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}