import { inspect } from 'util';
import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, Util } from 'discord.js';
import { version } from '../../../package.json';
import type { Client, Command } from '../../types';

const command: Command = {
	ownerOnly: true,
	category: 'Utility',
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluates some code and returns result')
		.addStringOption((option) =>
			option.setName('code').setDescription('The code to evaluate').setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName('hidden')
				.setDescription('Whether or not the reply should be shown just to you')
				.setRequired(false)
		),
	execute: async ({ client, interaction }) => {
		const embed = new MessageEmbed()
			.setColor('DARK_GREEN')
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true })
			})
			.setTitle('Eval')
			.setTimestamp()
			.setFooter({ text: `Version ${version}` });

		let msg: string[] = [];

		try {
			const [code, ephemeral] = [
				interaction.options.getString('code')!,
				interaction.options.getBoolean('hidden') ?? true
			];

			await interaction.deferReply({ ephemeral });

			const evaled = await eval(code);

			let cleaned = await clean(client, evaled);
			cleaned = cleaned.substring(0, 5500);

			msg = Util.splitMessage(cleaned, { maxLength: 1024 });
		} catch (_err) {
			embed.setColor('DARK_RED');
		} finally {
			embed.setDescription(codeBlock('js', msg.shift() ?? ''));

			if (msg.length >= 1) {
				for (const result of msg) {
					embed.addField('Continued', codeBlock('js', result));
				}
			}

			if (interaction.deferred) {
				interaction.editReply({ embeds: [embed] }).catch(console.error);
			} else {
				interaction.reply({ embeds: [embed] }).catch(console.error);
			}
		}
	}
};

export default command;

// https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/examples/making-an-eval-command.md

// This function cleans up and prepares the
// result of our eval command input for sending
// to the channel
const clean = async (client: Client, text: any): Promise<string> => {
	// If our input is a promise, await it before continuing
	if (text && text.constructor.name == 'Promise') text = await text;

	// If the response isn't a string, `util.inspect()`
	// is used to 'stringify' the code in a safe way that
	// won't error out on objects with circular references
	// (like Collections, for example)
	if (typeof text !== 'string') text = inspect(text, { depth: 1 });

	// Replace symbols with character code alternatives
	text = text
		.replace(/`/g, '`' + String.fromCharCode(8203))
		.replace(/@/g, '@' + String.fromCharCode(8203))
		.replace(client.token, '[REDACTED]');

	// Send off the cleaned up result
	return text;
};
