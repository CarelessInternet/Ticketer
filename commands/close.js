const connection = require('../db');
const {version} = require('../package.json');
const {MessageEmbed} = require('discord.js');
const {default: PasteAPI} = require('pastebin-api');

const pasteClient = new PasteAPI(process.env.pastebinApiKey);

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
        description: "Delete the support ticket, message content is saved via logs for 7 days",
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
      if (!guild.me.permissions.has(['MANAGE_THREADS', 'CREATE_PUBLIC_THREADS', 'CREATE_PRIVATE_THREADS', 'SEND_MESSAGES_IN_THREADS', 'MANAGE_MESSAGES'])) return interaction.reply({content: 'I need all thread permissions and manage messages to close tickets', ephemeral: true});
      
      const record = await ifExists(guildId);
      if (!record || record['RoleID'] === '0') return interaction.reply({content: 'No ticketing config or available role could be found, please create one', ephemeral: true});

      if (channel.parent.id === record['SupportChannel'] || (channel.parent.name.toLowerCase() === 'support' && record['SupportChannel'] === '0')) {
        const {members} = await guild.roles.fetch(record['RoleID']);
        const ticketName = `ticket-${user.id}`;
        if (ticketName !== channel.name && !members.has(user.id)) return interaction.reply({content: 'You cannot close this thread, you are not the original author or a manager', ephemeral: true});
  
        const embed = new MessageEmbed()
        .setColor('DARK_GREEN')
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .setTitle('Ticket Closed')
        .setDescription(`<@${user.id}> closed the support ticket`)
        .setTimestamp()
        .setFooter(`Version ${version}`);
  
        await interaction.reply({embeds: [embed]});
  
        switch (interaction.options.getSubcommand()) {
          case 'archive': {
            channel.setArchived(true);

            if (record['LogsChannel'] !== '0') {
              const logEmbed = new MessageEmbed()
              .setColor('DARK_GREEN')
              .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({dynamic: true}))
              .setTitle('Ticket Closed')
              .setDescription(`<@!${interaction.user.id}> closed a ticket\nView it at <#${channel.id}>`)
              .addField('Name of Ticket', channel.name)
              .setTimestamp()
              .setFooter(`Version ${version}`);

              const logsChannel = await guild.channels.fetch(record['LogsChannel']);
              if (!logsChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;

              logsChannel.send({embeds: [logEmbed]});
            }
            break;
          }
          case 'delete': {
            if (record['LogsChannel'] !== '0') {
              const logsChannel = await guild.channels.fetch(record['LogsChannel']);
              if (!logsChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
              
              // this code will not work when message content becomes a privileged intent
              const messagesCache = channel.messages.cache;
              const messages = messagesCache.map((msg) => {
                if (msg.author?.id !== interaction.client.user?.id) {
                  const user = msg.author?.tag ?? 'Unknown';
                  const content = msg.content ?? '';
  
                  return `${user}: ${content}\n`;
                }
              });
              const botPinEmbed = messagesCache.first();
              const subject = botPinEmbed.author?.id === interaction.client.user?.id ? (botPinEmbed?.embeds?.[0]?.fields?.[0]?.value ?? 'Not Found') : 'Not Found';
              
              const url = await pasteClient.createPaste({
                code: `Subject: ${subject}\n\n` + messages.join(' '),
                expireDate: '1W',
                name: `Ticketer-${Date.now()}`
              });
              
              const logEmbed = new MessageEmbed()
              .setColor('DARK_GREEN')
              .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({dynamic: true}))
              .setTitle('Ticket Deleted')
              .setDescription(`<@!${interaction.user.id}> deleted a ticket`)
              .addField('Name of Ticket', channel.name)
              .addField('Link to Message History', `[${url}](${url})`)
              .setTimestamp()
              .setFooter(`Version ${version}`);
              
              logsChannel.send({embeds: [logEmbed]});
            }

            channel.delete();
            break;
          }
          default:
            break;
        }
      } else {
        return interaction.reply({content: 'You may only close support tickets', ephemeral: true});
      }
    } catch(err) {
      console.error(err);
      interaction.followUp({content: 'An error occured whilst closing the thread, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}