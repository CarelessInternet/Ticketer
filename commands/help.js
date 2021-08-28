const {readdirSync, readFileSync} = require('fs');
const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const optionType = require('../info/data-options');

function options(command) {
  if (!command.options[0]) return 'None';
  return command.options.reduce((acc, curr) => {
    return acc + `[*${curr.required ? 'required' : 'optional'} option ${optionType.get(curr.type)}*]\n**${curr.description}**\n`;
  }, '');
}
function examples(command, prefix) {
  return command.examples.reduce((acc, curr) => {
    return acc + `\`${prefix}${curr}\`\n`;
  }, '');
}
function fieldValue(list) {
  return list.reduce((acc, curr) => {
    return acc + `\`${curr.name}${curr.options[0]?.required ? '*' : ''}\`, `;
  }, '').slice(0, -2) || '`Empty`';
}

module.exports = {
  name: 'help',
  data: {
    name: "help",
    description: "Displays all of the available commands",
    category: "utility",
    options: [
      {
        name: "command",
        description: "The command you want to get more information about",
        type: 3,
        required: false
      }
    ],
    examples: [
      "help"
    ]
  },
  execute(interaction, cmd, prefix) {
    const requestedCommand = interaction.options.getString('command');
    const files = readdirSync('./commands/').filter(file => file.endsWith('.js'));
    const commands = files.reduce((acc, file) => {
      acc.push(require(`./${file}`).data);
      return acc;
    }, []);

    if (requestedCommand) {
      const command = commands.find(file => file.name === requestedCommand.toLowerCase());
      if (!command) return interaction.reply({content: 'Requested command does not exist', ephemeral: true}).catch(console.error);
      if (command.name && command.type && !command.description && !command.options) return interaction.reply({content: 'This is a context menu command, information cannot be given about it', ephemeral: true}).catch(console.error);

      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle(`Command: \`${command.name}\``)
      .addField('Category', command.category.charAt(0).toUpperCase() + command.category.slice(1))
      .addField('Description', command.description || 'No description')
      .setTimestamp();

      const categories = [
        {
          name: 'Options',
          value: options(command)
        },
        {
          name: 'Examples',
          value: examples(command, prefix)
        }
      ];

      categories.forEach(curr => embed.addField(curr.name, curr.value));
      interaction.reply({embeds: [embed]}).catch(console.error);
    } else {
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Command List')
      .setDescription('A list of all available commands')
      .addField('Prefix', `The prefix is \`${prefix}\`, and it\'s unchangeable, due to message content soon being [deprecated in April 2022](https://support-dev.discord.com/hc/en-us/articles/4404772028055)`)
      .addField('Support', readFileSync('./info/support.txt', 'utf8'))
      .addField('Invite', readFileSync('./info/invitelink.txt', 'utf8'))
      .addField('\u200B', '\u200B')
      .setTimestamp()
      .setFooter(`* means that options are required, use ${prefix}help command to view more information about that command`);

      const categories = [
        {
          name: 'Utility',
          value: fieldValue(commands.filter(cmd => cmd.category === 'utility'))
        },
        {
          name: 'Ticketing',
          value: fieldValue(commands.filter(cmd => cmd.category === 'ticketing'))
        },
        {
          name: 'Staff',
          value: fieldValue(commands.filter(cmd => cmd.category === 'staff'))
        }
      ];

      categories.forEach(curr => embed.addField(curr.name, curr.value, true));
      if (process.env['NODE_ENV'] === 'production') {
        const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
          .setLabel('Vote for Me')
          .setURL(`https://top.gg/bot/${process.env.clientID}/vote`)
          .setStyle('LINK')
        );

        interaction.reply({embeds: [embed], components: [row]}).catch(console.error);
      } else {
        interaction.reply({embeds: [embed]}).catch(console.error);
      }
    }
  }
}