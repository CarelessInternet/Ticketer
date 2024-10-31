import type { BaseTranslation } from '../i18n-types';
import ERROR_TITLE from './errorTitle';
import type { PresenceUpdateStatus } from 'discord.js';
import automaticThreads from './automaticThreads';
import threads from './threads';
import userForums from './userForums';

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
		'bot-statistics': {
			data: {
				name: 'bot-statistics',
				description: 'Show the statistics of the bot.',
				options: [
					{
						name: 'hidden',
						description: 'Whether the message should be shown to you or everybody.',
					},
				],
			},
			command: {
				errors: {
					noShard: {
						description: 'No shard for the bot could be found.',
					},
				},
				embeds: [
					{
						title: 'Bot Statistics',
						description: "The data below shows information about the bot's statistics.",
						fields: [
							'Cached Users',
							'Channels + Threads',
							'Channels - Threads',
							'Emojis',
							'Servers',
							'Server Members',
							'Individual Shards',
						],
						fallbackFieldValue: 'Unknown',
						shardsStats: ['Shard', 'Ping', 'RAM Usage', 'Servers', 'Status', 'Up Since', 'Member Count'],
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
		'proxy-ticket': {
			chat: {
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
			'context-user': {
				data: {
					name: 'Create Ticket by Proxy',
				},
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
						title: {
							success: 'Purged Messages',
							error: ERROR_TITLE,
						},
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
		'view-user-tickets': {
			chat: {
				data: {
					name: 'view-user-tickets',
					description: "View a user's thread tickets.",
					options: [
						{
							name: 'member',
							description: 'The member whose tickets you want to see.',
						},
					],
				},
			},
			'context-user': {
				data: {
					name: "View User's Tickets",
				},
			},
			common: {
				command: {
					content: 'Total amount of tickets by {member:string} in the server: {amount:number}.',
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
	miscellaneous: {
		paginationButtons: {
			next: {
				label: 'Next Page',
			},
			previous: {
				label: 'Previous Page',
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
