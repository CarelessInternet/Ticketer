import type { BaseTranslation } from '../i18n-types.js';
import ERROR_TITLE from './errorTitle.js';
import type { PresenceUpdateStatus } from 'discord.js';
import automaticThreads from './automaticThreads.js';
import threads from './threads.js';
import userForums from './userForums.js';

const en_GB = {
	commands: {
		'bot-custom-status': {
			data: {
				name: 'bot-custom-status',
				description: "Change the shard's custom status.",
				options: [
					{
						name: 'custom-status',
						description: 'The new custom status the bot/shard should display. Write "[shardId]" for the shard\'s ID.',
					},
					{
						name: 'display-status',
						description: 'The display status which the bot/shard should show.',
						choices: {
							DoNotDisturb: 'Do Not Disturb',
							Idle: 'Idle',
							Invisible: 'Invisible',
							Online: 'Online',
						} as Record<Exclude<keyof typeof PresenceUpdateStatus, 'Offline'>, string>,
					},
				],
			},
			command: {
				embeds: [
					{
						title: 'Updated the Status!',
						description: "The bot's status has been updated!",
					},
				],
			},
		},
		close: {
			data: {
				name: 'close',
				description: 'Close/Archive the thread or support ticket.',
			},
		},
		delete: {
			data: {
				name: 'delete',
				description: 'Delete the thread or support ticket.',
			},
		},
		help: {
			data: {
				name: 'help',
				description: 'View all available commands.',
				options: [
					{
						name: 'hidden',
						description: 'Whether the message should be shown to you or everybody.',
					},
				],
			},
			command: {
				embeds: [
					{
						title: 'Command List',
						description: 'Here is the list of the available commands: {commands:string}.',
						fields: [
							{
								name: '❓ How to Get Started?',
								value: 'Looking for how to configure the bot? Click the "Command Documentation" link below.',
							},
							{
								name: '🔗 Links',
								links: {
									commandDocumentation: 'Command Documentation',
									invite: 'Invite Link',
									supportServer: 'Support Server',
									website: 'Website',
								},
							},
						],
					},
				],
			},
		},
		'lock-and-close': {
			data: {
				name: 'lock-and-close',
				description: 'Lock and close the thread or support ticket.',
			},
		},
		lock: {
			data: {
				name: 'lock',
				description: 'Lock the thread or support ticket.',
			},
		},
		migrate: {
			data: {
				name: 'migrate',
				description: 'Deploy any database migrations that may be required.',
			},
			command: {
				success: 'Successfully migrated the database!',
			},
		},
		ping: {
			data: {
				name: 'ping',
				description: 'View the latency and status of the bot.',
			},
			command: {
				embeds: [
					{
						title: 'Pinging...',
					},
					{
						title: 'Result',
						fields: [
							{
								name: 'Ping',
								value: '⌛ {ms:number}ms',
							},
							{
								name: 'Latency',
								value: '🏓 Roughly {ms:number}ms',
							},
							{
								name: 'WebSocket Status',
								value: '⚙️ {status:string}',
							},
						],
					},
				],
			},
		},
		'proxy-ticket-chat': {
			data: {
				name: 'proxy-ticket',
				description: 'Create a ticket by proxy for a member.',
				options: [
					{
						name: 'member',
						description: 'The member who you want to create a ticket for.',
					},
				],
			},
		},
		'proxy-ticket-user': {
			data: {
				name: 'Create Ticket by Proxy',
			},
		},
		purge: {
			data: {
				name: 'purge',
				description: 'Remove the latest messages in the current channel by the specified amount.',
				options: [
					{
						name: 'amount',
						description: 'The amount of messages to delete.',
					},
				],
			},
			command: {
				embeds: [
					{
						title: 'Purged Messages',
						description: 'Successfully deleted the last {amount:number} message{{s}}!',
					},
				],
			},
		},
		'rename-title': {
			data: {
				name: 'rename-title',
				description: 'Rename the title of the thread or support ticket.',
			},
		},
		'show-tickets': {
			data: {
				name: 'show-tickets',
				description: 'Show the tickets you have in the server.',
				options: [
					{
						name: 'state',
						description: "Filter by the tickets' states.",
					},
				],
			},
			command: {
				buttons: {
					previous: {
						label: 'Previous Page',
					},
					next: {
						label: 'Next Page',
					},
				},
				content: 'Total amount of tickets by you in the server: {amount:number}.',
				embeds: [
					{
						fields: [
							{
								name: 'Thread Channel',
							},
							{
								name: 'State',
							},
						],
					},
				],
			},
		},
		ticket: {
			data: {
				name: 'ticket',
				description: 'Create a support ticket within a category.',
			},
		},
	},
	events: {
		interactionCreate: {
			ownerOnly: {
				error: 'You need to be the owner of the bot to run this command!',
			},
		},
		guildMemberAdd: {
			welcome: {
				title: 'Welcome {member:string}!',
				message: '{member:string} Thank you for joining the server!',
			},
			farewell: {
				title: 'Goodbye {member:string}!',
				message: '{member:string} has left the server.',
			},
		},
	},
	tickets: {
		errors: {
			invalidTicket: {
				title: ERROR_TITLE,
				description: 'You cannot edit a thread or ticket in this channel.',
			},
		},
		automaticThreads,
		threads,
		userForums,
	},
} satisfies BaseTranslation;

export default en_GB;
