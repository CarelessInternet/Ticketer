import type { BaseTranslation } from '../i18n-types.js';

const ERROR_TITLE = 'An Error Occured';

const en_GB = {
	commands: {
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
								name: '🔗 Links',
								links: {
									invite: 'Invite Link',
									supportServer: 'Support Server',
								},
							},
						],
					},
				],
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
						description: 'Successfully deleted the last {amount:number} messages!',
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
		threads: {
			categories: {
				configuration: {
					openingMessage: {
						title: '{category:string}: New Support Ticket',
						description: '{member:string} created a new support ticket in the {category:string} category!',
					},
				},
				categoryList: {
					placeholder: 'Select a category to create a ticket within.',
				},
				createModal: {
					title: {
						label: 'Title',
						placeholder: 'Write a title to be used in the ticket.',
					},
					description: {
						label: 'Description',
						placeholder: 'Write a description to be used in the ticket.',
					},
					modalTitle: 'Ticket Title & Description',
				},
				createTicket: {
					errors: {
						invalidId: {
							title: ERROR_TITLE,
							description: 'The category ID is not valid.',
						},
					},
				},
			},
		},
	},
} satisfies BaseTranslation;

export default en_GB;
