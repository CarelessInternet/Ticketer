const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

module.exports = {
  name: 'kick',
  data: {
    name: "kick",
    description: "Kicks a user from the server",
    category: "staff",
    options: [
      {
        name: "user",
        description: "The user you want to kick",
        type: 6,
        required: true
      },
      {
        name: "reason",
        description: "The reason why you are kicking the user",
        type: 3,
        required: false
      }
    ]
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has('KICK_MEMBERS')) return interaction.reply({content: 'You do not have the permissions to kick a member', ephemeral: true}).catch(console.error);
    if (!interaction.guild.me.permissions.has(['KICK_MEMBERS', 'MANAGE_MESSAGES'])) return interaction.reply({content: 'I need the kicker members and manage messages permission to run this command', ephemeral: true}).catch(console.error);

    const [member, reason] = [interaction.options.getMember('user'), interaction.options.getString('reason') ?? ''];
    if (member.user.id === interaction.user.id) return interaction.reply({content: 'You cannot kick yourself', ephemeral: true}).catch(console.error);
    if (member.permissions.has('KICK_MEMBERS')) return interaction.reply({content: 'Failed to kick because the user has kick members permission', ephemeral: true}).catch(console.error);
    if (!member.kickable) return interaction.reply({content: 'I am unable to kick this member', ephemeral: true}).catch(console.error);

    const filter = i => (i.customId === 'Confirm' || i.customId === 'Abort') && i.member.user.id === interaction.member.id;
    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('Confirm')
      .setLabel('✔️ Kick')
      .setStyle('SUCCESS'),
      new MessageButton()
      .setCustomId('Abort')
      .setLabel('❌ Abort')
      .setStyle('DANGER')
    );
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setAuthor(interaction.user.tag, interaction.user.avatarURL())
    .setTitle('Kick Confirmation')
    .setDescription(`Are you sure you want to kick <@${member.user.id}>${reason ? ' for the following reason: ' + reason : ''}?`)
    .setTimestamp();

    const confirmation = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    }).catch(console.error);
    const collector = confirmation.createMessageComponentCollector({filter, max: 1, time: 10 * 1000});

    collector.on('collect', async i => {
      const reaction = i.customId;
      if (reaction === 'Confirm') {
        const user = await member.kick(reason).catch(console.error);
        embed.setDescription(`👍 ${user.id ? '<@' + user.id + '>' : user.user.username} has been kicked from ${interaction.guild.name}`);

        if (reason) {
          embed.addField('Reason', reason);
        }
        i.update({embeds: [embed], components: []}).catch(console.error);
      } else {
        embed.setDescription(`The kick on <@${member.user.id}> has been aborted`);
        i.update({embeds: [embed], components: []}).catch(console.error);
      }
    });
    collector.on('end', (collected, reason) => {
      switch (reason) {
        case 'time':
          return confirmation.edit({content: 'Kick aborted due to no response', components: []}).catch(console.error);
        case 'messageDelete':
          return interaction.channel.send({content: 'Kick aborted because the message was deleted'}).catch(console.error);
        case 'channelDelete':
          return;
        case 'guildDelete':
          return;
        case 'limit':
          return;
        default:
          return interaction.channel.send({content: 'Kick aborted due to an unknown reason'}).catch(console.error);
      }
    });
  }
}