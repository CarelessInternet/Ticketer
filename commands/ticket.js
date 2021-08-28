const connection = require('../db');
const dateFormat = require('dateformat');
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
  name: 'ticket',
  data: {
    name: "ticket",
    description: "Creates a support ticket under the #support channel",
    category: "ticketing",
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
      if (!interaction.guild.me.permissions.has(['MANAGE_THREADS', 'USE_PUBLIC_THREADS', 'USE_PRIVATE_THREADS'])) return interaction.reply({content: 'I need all thread permissions to create tickets', ephemeral: true});
      if (interaction.channel.type !== 'GUILD_TEXT') return interaction.reply({content: 'You must use this command in a valid text channel', ephemeral: true});
      if (interaction.channel.name.toLowerCase() !== 'support') return interaction.reply({content: 'Tickets are only allowed in the support channel', ephemeral: true});

      const config = await checkForConfig(interaction.guildId);
      if (!config) return interaction.reply({content: 'I am missing the config for tickets', ephemeral: true});
      
      const subject = interaction.options.getString('subject');
      const {user, channel, guild} = interaction;
      const name = `ticket-${user.username.slice(0, 4).toLowerCase()}-${user.discriminator}`;
      if (channel.threads.cache.find(thread => thread.name === name)) return interaction.reply({content: 'You must close your previous ticket before creating a new one', ephemeral: true});

      const thread = await channel.threads.create({
        name: name,
        autoArchiveDuration: 60 * 24,
        type: 'GUILD_PUBLIC_THREAD',
        reason: subject
      });
      const embed = new MessageEmbed()
      .setColor('DARK_GREEN')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle('Support Ticket')
      .setDescription(`<@${user.id}> created a new support ticket.`)
      .addField('Subject', subject)
      .addField('Date', dateFormat(thread.createdAt, 'yyyy-mm-dd HH:MM:ss'))
      .setTimestamp();

      const msg = await thread.send({embeds: [embed]});
      await msg.pin();
      await thread.lastMessage.delete();

      const {RoleID} = config;
      const {members} = await guild.roles.fetch(RoleID);
      members.forEach(manager => thread.members.add(manager.user.id));
      thread.members.add(user.id);

      interaction.reply({content: `Successfully created the support ticket: <#${thread.id}>`});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}