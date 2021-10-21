const connection = require('../db');
const {version} = require('../package.json');
const {MessageEmbed} = require('discord.js');

function checkForConfig(guildId) {
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
    name: "ticket",
    description: "Creates a support ticket under the support channel",
    category: "ticketing",
    cooldown: 15,
    options: [
      {
        name: "subject",
        description: "The subject/message of the ticket",
        type: 3,
        required: true
      }
    ],
    examples: [
      "ticket Why no work???",
      "ticket Help how to do this??",
      "ticket sample message",
      "ticket sample text"
    ]
  },
  async execute(interaction) {
    try {
      if (!interaction.guild.me.permissions.has(['MANAGE_THREADS', 'CREATE_PUBLIC_THREADS', 'CREATE_PRIVATE_THREADS', 'SEND_MESSAGES_IN_THREADS', 'MANAGE_MESSAGES'])) return interaction.reply({content: 'I need all thread permissions and manage messages to create tickets', ephemeral: true});
      if (interaction.channel.type !== 'GUILD_TEXT') return interaction.reply({content: 'You must use this command in a valid text channel', ephemeral: true});
      
      const config = await checkForConfig(interaction.guildId);
      if (!config) return interaction.reply({content: 'I am missing the config for tickets', ephemeral: true});

      if (interaction.channel.id === config['SupportChannel'] || (interaction.channel.name.toLowerCase() === 'support' && config['SupportChannel'] === '0')) {
        const subject = interaction.options.getString('subject');
        const {user, channel, guild} = interaction;
        const name = `ticket-${user.id}`;
        if (channel.threads.cache.find(thread => thread.name === name && !thread.archived)) return interaction.reply({content: 'You must close your previous ticket before creating a new one', ephemeral: true});
        
        const {RoleID, ReplyEmbed, LogsChannel} = config;
        if (RoleID === '0') return interaction.reply({content: 'Missing the managers, please add them via ticket-config', ephemeral: true});
        
        const thread = await channel.threads.create({
          name: name,
          autoArchiveDuration: 60 * 24,
          type: guild.premiumTier === 'TIER_2' ? 'GUILD_PRIVATE_THREAD' : 'GUILD_PUBLIC_THREAD',
          reason: subject
        });
        const threadEmbed = new MessageEmbed()
        .setColor('DARK_GREEN')
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
        .setTitle('Support Ticket')
        .setDescription(`<@${user.id}> created a new support ticket.`)
        .addField('Subject', subject)
        .addField('Ticket Date', `<t:${Math.floor(thread.createdTimestamp / 1000)}:R>`)
        .setTimestamp()
        .setFooter(`Version ${version}`);
  
        const msg = await thread.send({embeds: [threadEmbed]});
        await msg.pin();
        if (thread.lastMessage.system) await thread.lastMessage.delete();
  
        const {members} = await guild.roles.fetch(RoleID);
        members.forEach(manager => thread.members.add(manager.user.id));
        thread.members.add(user.id);
  
        if (ReplyEmbed) {
          const ticketEmbed = new MessageEmbed()
          .setColor('DARK_GREEN')
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
          .setTitle('Ticket Created')
          .setDescription(`Your support ticket has successfully been created!\nView it at <#${thread.id}>`)
          .addField('Subject', subject)
          .addField('Name of Ticket', thread.name)
          .setTimestamp()
          .setFooter(`Version ${version}`);
    
          interaction.reply({embeds: [ticketEmbed]});
        } else {
          interaction.reply({content: `Ticket successfully created! View it at <#${thread.id}>`, ephemeral: true});
        }

        if (LogsChannel !== '0') {
          const logEmbed = new MessageEmbed()
          .setColor('DARK_GREEN')
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
          .setTitle('Ticket Created')
          .setDescription(`<@!${interaction.user.id}> created a ticket!\nView it at <#${thread.id}>`)
          .addField('Subject', subject)
          .addField('Name of Ticket', thread.name)
          .setTimestamp()
          .setFooter(`Version ${version}`);

          const logsChannel = await interaction.guild.channels.fetch(LogsChannel);
          if (!logsChannel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES')) return;

          logsChannel.send({embeds: [logEmbed]});
        }
      } else {
        return interaction.reply({content: 'Tickets are only allowed in the support/ticket channel', ephemeral: true});
      }
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}