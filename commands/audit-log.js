const {MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "audit-log",
    description: "Display the audit log",
    category: "staff",
    options: [
      {
        name: "limit",
        description: "The maximum amount to grab from the audit log",
        type: 4,
        required: false
      }
    ],
    examples: [
      "audit-log 3",
      "audit-log 5",
      "audit-log 10",
      "audit-log 15"
    ]
  },
  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has('VIEW_AUDIT_LOG')) return interaction.reply({content: 'You need the view audit log permission to run this command'});
      if (!interaction.guild.me.permissions.has('VIEW_AUDIT_LOG')) return interaction.reply({content: 'I need the view audit log permission to run this command'});

      const limit = interaction.options.getInteger('limit') ?? 15;
      if (limit > 15) {
        return interaction.reply({content: 'Limit cannot be higher than 15'});
      }
      
      const {entries} = await interaction.guild.fetchAuditLogs({limit});
      const changes = entries.map((log) => {
        const action = log.action;
        const user = log.executor ? `<@!${log.executor?.id}>` : 'Unknown';
        const timestamp = `<t:${Math.floor(log.createdTimestamp / 1000)}:R>`;
        
        return `${user}: ${action} ${timestamp}`;
      });
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({dynamic: true}))
      .setTitle('Audit Log')
      .setDescription('List of changes saved in audit log')
      .addField('Changes', changes.join('\n'))
      .setTimestamp()
      .setFooter(`Limit: ${limit}`);

      interaction.reply({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error has occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}