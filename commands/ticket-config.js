const connection = require('../db');
const {version} = require('../package.json');
const {MessageEmbed} = require('discord.js');

function ifExist(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM TicketingManagers WHERE GuildID = ?', [guildId]);
      resolve(rows[0] ?? false);
    } catch(err) {
      reject(err);
    }
  });
}
function insert(guildId, roleId) {
  return new Promise(async (resolve, reject) => {
    try {
      await connection.execute('INSERT INTO TicketingManagers (GuildID, RoleID, ReplyEmbed) VALUES (?, ?, true)', [guildId, roleId]);
      resolve();
    } catch(err) {
      reject(err);
    }
  });
}
function updateRole(guildId, roleId) {
  return new Promise(async (resolve, reject) => {
    try {
      await connection.execute('UPDATE TicketingManagers SET RoleID = ? WHERE GuildID = ?', [roleId, guildId]);
      resolve();
    } catch(err) {
      reject(err);
    }
  });
}
function updateReplyEmbed(guildId, boolean) {
  return new Promise(async (resolve, reject) => {
    try {
      await connection.execute('UPDATE TicketingManagers SET ReplyEmbed = ? WHERE GuildID = ?', [boolean, guildId]);
      resolve();
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "ticket-config",
    description: "Edit ticketing details",
    category: "ticketing",
    options: [
      {
        name: "managers",
        description: "Specifies the managers of the tickets. They will automatically get added to each ticket",
        type: 1,
        options: [
          {
            name: "role",
            description: "The role that manages tickets",
            type: 8,
            required: true
          }
        ]
      },
      {
        name: "reply-embed",
        description: "Choose to have the 'ticket created' message on or off",
        type: 1,
        options: [
          {
            name: "type",
            description: "On or off",
            type: 5,
            required: true
          }
        ]
      }
    ],
    examples: [
      "ticket-config managers @Mods"
    ]
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({content: 'You need the manage server permission to edit ticketing config'}).catch(console.error);

    try {
      switch (interaction.options.getSubcommand()) {
        case 'managers': {
          const {id, name} = interaction.options.getRole('role');
          if (name === '@everyone') return interaction.reply({content: 'Role cannot be @ everyone', ephemeral: true});
          
          const {guildId} = interaction;
          const exists = await ifExist(guildId);

          if (!exists) await insert(guildId, id);
          else await updateRole(guildId, id);

          const embed = new MessageEmbed()
          .setColor('DARK_GREEN')
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
          .setTitle('Changed Managers')
          .setDescription(`<@${interaction.user.id}> changed managers to <@&${id}>`)
          .setTimestamp()
          .setFooter(`Version ${version}`);

          interaction.reply({embeds: [embed]});
          break;
        }
        case 'reply-embed': {
          const type = interaction.options.getBoolean('type');

          const {guildId} = interaction;
          const exists = await ifExist(guildId);

          if (!exists) {
            return interaction.reply({content: 'You need to create the managers first before editing this configuration', ephemeral: true});
          }

          await updateReplyEmbed(guildId, type);

          const embed = new MessageEmbed()
          .setColor('DARK_GREEN')
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
          .setTitle('Changed Reply Embed Option')
          .setDescription(`<@${interaction.user.id}> changed reply embeds to ${type === true ? 'on' : 'off'}`)
          .setTimestamp()
          .setFooter(`Version ${version}`);

          interaction.reply({embeds: [embed]});
          break;
        }
        default:
          break;
      }
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}