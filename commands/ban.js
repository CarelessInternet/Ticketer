const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

module.exports = {
  data: {
    name: "ban",
    description: "Bans a user from the server",
    category: "staff",
    options: [
      {
        name: "user",
        description: "The user you want to ban",
        type: 6,
        required: true
      },
      {
        name: "reason",
        description: "The reason for why you are banning the user",
        type: 3,
        required: false
      }
    ],
    examples: [
      "ban @SomeDude#1337",
      "ban @you#5555 why are you gae",
      "ban @noone#2321",
      "ban @whyamistillherejusttosuffer#1111 reason reason reason reason sample text"
    ]
  },
  async execute(interaction) {
    if (!interaction.member.permissions.has('BAN_MEMBERS')) return interaction.reply({content: 'You do not have the permissions to ban a member', ephemeral: true}).catch(console.error);
    if (!interaction.guild.me.permissions.has('BAN_MEMBERS')) return interaction.reply({content: 'I need the ban members permission to run this command', ephemeral: true}).catch(console.error);

    const [member, reason] = [interaction.options.getMember('user'), interaction.options.getString('reason') ?? ''];
    if (member.user.id === interaction.user.id) return interaction.reply({content: 'You cannot ban yourself', ephemeral: true}).catch(console.error);
    if (member.permissions.has('BAN_MEMBERS')) return interaction.reply({content: 'Failed to ban because the user has ban members permission', ephemeral: true}).catch(console.error);
    if (!member.bannable) return interaction.reply({content: 'I am unable to ban this member', ephemeral: true}).catch(console.error);

    const filter = i => (i.customId === 'Confirm' || i.customId === 'Abort') && i.member.user.id === interaction.member.id;
    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('Confirm')
      .setLabel('✔️ Ban')
      .setStyle('SUCCESS'),
      new MessageButton()
      .setCustomId('Abort')
      .setLabel('❌ Abort')
      .setStyle('DANGER')
    );
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({dynamic: true}))
    .setTitle('Ban Confirmation')
    .setDescription(`Are you sure you want to ban <@${member.user.id}>${reason ? ' for the following reason: ' + reason : ''}?`)
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
        const user = await member.ban({reason: reason}).catch(console.error);
        embed.setDescription(`👍 ${user.id ? '<@' + user.id + '>' : user.user.username} has been banned from ${interaction.guild.name}`);

        if (reason) {
          embed.addField('Reason', reason);
        }
        i.update({embeds: [embed], components: []}).catch(console.error);
      } else {
        embed.setDescription(`The ban on <@${member.user.id}> has been aborted`);
        i.update({embeds: [embed], components: []}).catch(console.error);
      }
    });
    collector.on('end', (collected, reason) => {
      switch (reason) {
        case 'time': {
          embed.setDescription(`The ban on <@${member.user.id}> has been aborted due to no response`);
          return confirmation.edit({embeds: [embed], components: []}).catch(console.error);
        }
        case 'messageDelete':
          return interaction.channel.send({content: 'Ban aborted because the message was deleted'}).catch(console.error);
        case 'channelDelete':
          return;
        case 'guildDelete':
          return;
        case 'limit':
          return;
        default:
          return interaction.channel.send({content: 'Ban aborted due to an unknown reason'}).catch(console.error);
      }
    });
  }
}