const connection = require('../db');
const {version} = require('../package.json');
const {MessageEmbed} = require('discord.js');

function ifExists(guildId) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM GuildMemberEvent WHERE GuildID = ?', [guildId]);
      resolve(rows[0] ? true : false);
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "welcome",
    description: "Enables welcome and goodbye messages in a specific channel",
    category: "staff",
    options: [
      {
        name: "add",
        description: "Adds welcome and goodbye messages to a specific channel",
        type: 1,
        options: [
          {
            name: "channel",
            description: "The channel you want the messages to be sent in",
            type: 7,
            required: true
          }
        ]
      },
      {
        name: "edit",
        description: "Edits the channel for messages to be sent in",
        type: 1,
        options: [
          {
            name: "channel",
            description: "The new channel you want the messages to be sent in",
            type: 7,
            required: true
          }
        ]
      },
      {
        name: "enable",
        description: "Enables welcome and goodbye messages",
        type: 1,
        options: []
      },
      {
        name: "disable",
        description: "Disables welcome and goodbye messages",
        type: 1,
        options: []
      }
    ],
    examples: [
      "welcome add #user-log",
      "welcome edit #log",
      "welcome enable",
      "welcome disable"
    ]
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has(['MANAGE_GUILD', 'MANAGE_CHANNELS'])) return interaction.reply({content: 'You need the manage server and channels permission to run this command', ephemeral: true}).catch(console.error);

    try {
      const commandType = interaction.options.getSubcommand();
      const {guildId} = interaction;
      const exists = await ifExists(guildId);
      const embed = new MessageEmbed()
      .setColor('DARK_GREEN')
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({dynamic: true}))
      .setTitle('Welcome/Goodbye Messages Modified')
      .setTimestamp()
      .setFooter(`Version ${version}`);

      switch (commandType) {
        case 'add': {
          // const {permissionsFor, type, id} = interaction.options.getChannel('channel');
          const channel = interaction.options.getChannel('channel');
          const {type, id} = channel;
          if (type !== 'GUILD_TEXT') return interaction.reply({content: 'Channel must be a valid text channel', ephemeral: true});
          if (exists) return interaction.reply({content: 'A channel has already been added', ephemeral: true});
          if (!channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES')) return interaction.reply({content: `I need the send messages permission in <#${id}> to send welcome and goodbye messages`, ephemeral: true});

          await connection.execute('INSERT INTO GuildMemberEvent (GuildID, ChannelID, Enabled) VALUES (?, ?, TRUE)', [guildId, id]);
          embed.setDescription(`Successfully created welcome/goodbye messages in <#${id}>!`);
          interaction.reply({embeds: [embed]});
          break;
        }
        case 'edit': {
          // const {permissionsFor, type, id} = interaction.options.getChannel('channel');
          const channel = interaction.options.getChannel('channel');
          const {type, id} = channel;
          if (type !== 'GUILD_TEXT') return interaction.reply({content: 'Channel must be a valid text channel', ephemeral: true});
          if (!exists) return interaction.reply({content: 'You must add a channel first before editing', ephemeral: true});
          if (!channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES')) return interaction.reply({content: `I need the send messages permission in <#${id}> to send welcome and goodbye messages`, ephemeral: true});

          await connection.execute('UPDATE GuildMemberEvent SET ChannelID = ? WHERE GuildID = ?', [id, guildId]);
          embed.setDescription(`Successfully changed channel to <#${id}>!`)
          interaction.reply({embeds: [embed]});
          break;
        }
        case 'enable': {
          if (!exists) return interaction.reply({content: 'You must add a channel first before enabling', ephemeral: true});

          await connection.execute('UPDATE GuildMemberEvent SET Enabled = TRUE WHERE GuildID = ?', [guildId]);
          embed.setDescription('Successfully enabled welcome and goodbye messages!');
          interaction.reply({embeds: [embed]});
          break;
        }
        case 'disable': {
          if (!exists) return interaction.reply({content: 'You must add a channel first before disabling', ephemeral: true});

          await connection.execute('UPDATE GuildMemberEvent SET Enabled = FALSE WHERE GuildID = ?', [guildId]);
          embed.setDescription('Successfully disabled welcome and goodbye messages!');
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