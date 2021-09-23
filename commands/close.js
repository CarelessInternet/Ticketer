const connection = require('../db');
const {version} = require('../package.json');
const {MessageEmbed} = require('discord.js');

function ifExists(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [guildId]);
      resolve(rows[0] ?? false);
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "close",
    description: "Closes the current support ticket",
    category: "ticketing",
    options: [
      {
        name: "archive",
        description: "Archive the support ticket",
        type: 1,
        options: []
      },
      {
        name: "delete",
        description: "Delete the support ticket",
        type: 1,
        options: []
      }
    ],
    examples: [
      "close archive",
      "close delete"
    ]
  },
  async execute(interaction) {
    try {
      const {user, channel, guild, guildId} = interaction;
      if (channel.type !== 'GUILD_PRIVATE_THREAD' && channel.type !== 'GUILD_PUBLIC_THREAD') return interaction.reply({content: 'You must be in a support ticket to close it', ephemeral: true});
      if (!interaction.guild.me.permissions.has(['MANAGE_THREADS', 'USE_PUBLIC_THREADS', 'USE_PRIVATE_THREADS', 'MANAGE_MESSAGES'])) return interaction.reply({content: 'I need all thread permissions and manage messages to close tickets', ephemeral: true});
      if (channel.parent.name.toLowerCase() !== 'support') return interaction.reply({content: 'You may only close support tickets', ephemeral: true});
      
      const record = await ifExists(guildId);
      if (!record || record['RoleID'] === '0') return interaction.reply({content: 'No ticketing config or available role could be found, please create one', ephemeral: true});
      
      const {members} = await guild.roles.fetch(record['RoleID']);
      const ticketName = `ticket-${user.id}`;
      if (ticketName !== channel.name && !members.has(user.id)) return interaction.reply({content: 'You cannot close this thread, you are not the original author or a manager', ephemeral: true});

      const embed = new MessageEmbed()
      .setColor('DARK_GREEN')
      .setAuthor(user.tag, user.avatarURL())
      .setTitle('Ticket Closed')
      .setDescription(`<@${user.id}> closed the support ticket`)
      .setTimestamp()
      .setFooter(`Version ${version}`);
      await interaction.reply({embeds: [embed]});

      switch (interaction.options.getSubcommand()) {
        case 'archive':
          channel.setArchived(true);
          break;
        case 'delete':
          channel.delete();
          break;
        default:
          break;
      }
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An error occured whilst closing the thread, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}