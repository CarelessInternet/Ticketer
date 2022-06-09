import { inspect } from 'util';
import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import {
	MessageActionRow,
	MessageEmbed,
	type ModalActionRowComponent,
	TextInputComponent,
	Modal
} from 'discord.js';
import { version } from '../../../package.json';
import type { Client, Command } from '../../types';

const command: Command = {
	ownerOnly: true,
	category: 'Utility',
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluates some code and returns result'),
	execute: async function ({ interaction }) {
		const code = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId(command.modals!.customIds[1])
				.setLabel('Code')
				.setPlaceholder('Enter the code to be given to the eval command.')
				.setStyle('PARAGRAPH')
				.setMaxLength(4000)
				.setRequired(true)
		);
		const hidden = new MessageActionRow<ModalActionRowComponent>().addComponents(
			new TextInputComponent()
				.setCustomId(command.modals!.customIds[2])
				.setLabel('Ephemeral')
				.setPlaceholder('Whether the reply should be shown just to you.')
				.setValue('true')
				.setStyle('SHORT')
				.setMaxLength(5)
				.setRequired(true)
		);

		const modal = new Modal()
			.setCustomId(command.modals!.customIds[0])
			.setTitle('Eval')
			.addComponents(code, hidden);

		interaction.showModal(modal);
	},
	modals: {
		customIds: ['modal_eval', 'modal_eval_code', 'modal_eval_hidden'],
		execute: async function ({ client, interaction }) {
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
				const code = interaction.fields.getTextInputValue(this.customIds[1]);
				const ephemeral = interaction.fields.getTextInputValue(this.customIds[2]) === 'true';

				await interaction.deferReply({ ephemeral });

				const evaled = await eval(code);

				let cleaned = await clean(client, evaled);
				cleaned = cleaned.substring(0, 5500);

				msg = splitter(cleaned, 1024);
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
	}
};

export default command;

// https://stackoverflow.com/a/7624821/12425926

function splitter(str: string, length: number) {
	const strs = [];
	while (str.length > length) {
		let pos = str.substring(0, length).lastIndexOf(' ');

		pos = pos <= 0 ? length : pos;
		strs.push(str.substring(0, pos));

		let i = str.indexOf(' ', pos) + 1;

		if (i < pos || i > pos + length) i = pos;
		str = str.substring(i);
	}

	strs.push(str);
	return strs;
}

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
