import type { PresenceUpdateStatus } from 'discord.js';
import type { BaseTranslation } from '../i18n-types';
import automaticThreads from './automaticThreads';
import ERROR_TITLE from './errorTitle';
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
		'bot-profile': {
			data: {
				name: 'bot-profile',
				description: "Modify the bot's profile on this server.",
			},
			command: {
				container: {
					heading: 'Below are the configurations you can edit:',
					menu: {
						placeholder: 'Choose a field to change.',
						name: {
							label: 'Display Name',
							description: 'Edit my name on the server.',
						},
						bio: {
							label: 'Bio',
							description: 'Edit my bio on the server.',
						},
						avatar: {
							label: 'Avatar',
							description: 'Edit my profile picture on the server.',
						},
						banner: {
							label: 'Banner',
							description: 'Edit my banner on the server.',
						},
					},
				},
				modals: {
					errors: {
						select: {
							title: ERROR_TITLE,
							description: 'The selected value could not be found.',
						},
						customId: {
							title: ERROR_TITLE,
							description: 'The modal custom ID could not be found.',
						},
					},
					name: {
						input: {
							title: 'Edit Name',
							labels: [
								{
									label: 'Nickname',
									description: 'Leave the input blank to reset the name.',
									text: {
										placeholder: 'Ticketer',
									},
								},
							],
						},
						response: {
							errors: {
								validation: {
									title: ERROR_TITLE,
								},
								permissions: {
									title: ERROR_TITLE,
									description: 'I need the Change Nickname permission to edit my nickname.',
								},
							},
							success: {
								heading: 'Changed Name',
								content: '{member:string} changed my display name from {oldName:string} to {newName:string}.',
							},
						},
					},
					bio: {
						input: {
							title: 'Edit Bio',
							labels: [
								{
									label: 'About Me*',
									description: '* The bio cannot be reset to the default!',
								},
							],
						},
						response: {
							errors: {
								validation: { title: ERROR_TITLE },
							},
							success: {
								heading: 'Changed Bio',
								content: {
									withBio: '{member:string} changed my bio to:',
									withoutBio: '{member:string} changed my bio to nothing.',
								},
							},
						},
					},
					avatar: {
						input: {
							title: 'Edit Avatar',
							labels: [
								{
									label: 'Profile Picture',
									description: 'Leave the input blank to reset the avatar.',
								},
							],
						},
						response: {
							errors: {
								unknown: {
									title: ERROR_TITLE,
									description: 'The avatar could not be used for an unknown reason.',
								},
							},
							success: {
								heading: 'Changed Avatar',
								content: '{member:string} changed my avatar from the left image to the right.',
							},
						},
					},
					banner: {
						input: {
							title: 'Edit Banner',
							labels: [
								{
									label: 'Banner',
									description: 'Leave the input blank to reset the banner.',
								},
							],
						},
						response: {
							errors: {
								unknown: {
									title: ERROR_TITLE,
									description: 'The banner could not be used for an unknown reason.',
								},
							},
							success: {
								heading: 'Changed Banner',
								content: {
									oldAndNew: '{member:string} changed my banner from the left image to the right.',
									oldAndNoNew: '{member:string} changed my banner from the image below to the default.',
									noOldAndNew: '{member:string} changed my banner the default image to the one below.',
									noOldAndNoNew: '{member:string} changed my banner from the default image to the default.',
								},
							},
						},
					},
				},
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
						title: ERROR_TITLE,
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
		'guild-blacklist': {
			data: {
				name: 'guild-blacklist',
				description: 'Handle blacklists of servers.',
				subcommands: [
					{
						name: 'overview',
						description: 'View all blacklists of servers.',
					},
					{
						name: 'create',
						description: 'Add a server blacklist.',
						options: [
							{
								name: 'id',
								description: 'The ID of the server to blacklist.',
							},
							{
								name: 'reason',
								description: 'The reason for the blacklist of the server.',
							},
						],
					},
					{
						name: 'delete',
						description: 'Remove a blacklist of a server.',
						options: [
							{
								name: 'id',
								description: 'The ID of the server to whitelist.',
							},
						],
					},
				],
			},
			command: {
				errors: {
					invalidFields: {
						title: ERROR_TITLE,
					},
				},
				embeds: {
					overview: {
						title: 'Server {id:string}',
						fields: [
							{
								name: 'Reason',
							},
							{
								name: 'Date',
							},
						],
					},
					create: {
						title: 'Blacklisted a Server',
						description: 'The server with the ID {id:string} has been blacklisted.',
						fields: [
							{
								name: 'Reason',
							},
							{
								name: 'Date',
							},
						],
					},
					delete: {
						title: 'Deleted a Server Blacklist',
						description: '{member:string} whitelisted the server with the ID {id:string}.',
					},
				},
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
				components: [
					{
						button: {
							label: 'Command Documentation',
						},
						text: [
							{
								content: '❗ Command List',
							},
						],
					},
					{
						text: '🔗 Links',
					},
					{
						links: { donate: 'Donate', invite: 'Invite Link', supportServer: 'Support Server', website: 'Website' },
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
				embeds: [
					{
						title: 'Migrated!',
						description: 'Successfully migrated the database!',
					},
				],
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
						title: ERROR_TITLE,
						description: 'An error occurred while trying to receive the replied message.',
					},
					{
						title: 'Result',
						fields: [
							{
								name: 'Ping',
								value: '⌛ {ms:number} ms',
							},
							{
								name: 'Latency',
								value: '🏓 Roughly {ms:number} ms',
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
						description: {
							success: 'Successfully deleted the last {amount:number} message{{s}}!',
							error:
								'I need the View Channel, Read Message History, and Manage Messages permission to delete messages.',
						},
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
			blacklisted: {
				title: ERROR_TITLE,
				description: 'This server has been blacklisted from using the bot!',
				fields: [
					{
						name: 'Reason',
					},
					{
						name: 'Date',
					},
				],
			},
			ownerOnly: {
				title: ERROR_TITLE,
				description: 'You need to be the owner of the bot to run this command!',
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
		threadMembersUpdate: {
			logs: {
				title: 'Ticket Author Left',
				description:
					'{member:string} left the thread at {thread:string} and therefore the ticket has been {state|{lock: locked, close: closed, lockAndClose: locked and closed, delete: deleted}}.',
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
