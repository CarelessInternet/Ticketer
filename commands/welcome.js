const connection = require('../db');

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
  name: 'welcome',
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
    if (!interaction.guild.me.permissions.has('ADMINISTRATOR')) return interaction.reply({content: 'I need administrator to run this command', ephemeral: true}).catch(console.error);

    try {
      const commandType = interaction.options.getSubcommand();
      const {guildId} = interaction;
      const exists = await ifExists(guildId);

      switch (commandType) {
        case 'add': {
          const {type, id} = interaction.options.getChannel('channel');
          if (type !== 'GUILD_TEXT') return interaction.reply({content: 'Channel must be a valid text channel', ephemeral: true});
          if (exists) return interaction.reply({content: 'A channel has already been added', ephemeral: true});

          await connection.execute('INSERT INTO GuildMemberEvent (GuildID, ChannelID, Enabled) VALUES (?, ?, TRUE)', [guildId, id]);
          interaction.reply({content: `Successfully created welcome/goodbye messages in <#${id}>!`});
          break;
        }
        case 'edit': {
          const {type, id} = interaction.options.getChannel('channel');
          if (type !== 'GUILD_TEXT') return interaction.reply({content: 'Channel must be a valid text channel', ephemeral: true});
          if (!exists) return interaction.reply({content: 'You must add a channel first before editing', ephemeral: true});

          await connection.execute('UPDATE GuildMemberEvent SET ChannelID = ? WHERE GuildID = ?', [id, guildId]);
          interaction.reply({content: `Successfully changed channel to <#${id}>!`});
          break;
        }
        case 'enable': {
          if (!exists) return interaction.reply({content: 'You must add a channel first before enabling', ephemeral: true});

          await connection.execute('UPDATE GuildMemberEvent SET Enabled = TRUE WHERE GuildID = ?', [guildId]);
          interaction.reply({content: 'Successfully enabled welcome and goodbye messages!'});
          break;
        }
        case 'disable': {
          if (!exists) return interaction.reply({content: 'You must add a channel first before disabling', ephemeral: true});

          await connection.execute('UPDATE GuildMemberEvent SET Enabled = FALSE WHERE GuildID = ?', [guildId]);
          interaction.reply({content: 'Successfully disabled welcome and goodbye messages!'});
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