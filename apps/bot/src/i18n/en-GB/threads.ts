import type { ticketsThreads } from '@ticketer/database';
import ERROR_TITLE from './errorTitle';

export default {
	categories: {
		configuration: {
			openingMessage: {
				title: 'New Support Ticket',
				description: '{member:string} created a new support ticket in the {category:string} category!',
			},
		},
		categoryList: {
			placeholder: 'Select a category to create a ticket in.',
		},
		createModal: {
			errors: {
				invalidId: {
					title: ERROR_TITLE,
					description: 'The category ID is not valid.',
				},
			},
			title: {
				label: 'Title',
				description: 'Write a title to be used in the ticket.',
			},
			description: {
				label: 'Description',
				description: 'Write a description to be used in the ticket.',
			},
			modalTitle: 'Ticket Title & Description',
		},
		createTicket: {
			errors: {
				invalidUser: {
					title: ERROR_TITLE,
					description: 'A ticket for myself cannot be created, you silly.',
				},
				noCategories: {
					title: ERROR_TITLE,
					description: 'No ticket categories could be found.',
				},
				invalidId: {
					title: ERROR_TITLE,
					description: 'The category ID is not valid.',
				},
				noConfiguration: {
					title: ERROR_TITLE,
					description: 'The global or category configuration could not be found.',
				},
				noManagers: {
					title: ERROR_TITLE,
					description: 'There are no managers to add to the support ticket.',
				},
				invalidChannel: {
					title: ERROR_TITLE,
					description: 'The ticket channel does not exist or is not a text channel.',
				},
				noPermissions: {
					title: ERROR_TITLE,
					description:
						'I do not have the required permissions in the channel to create a ticket: {permissions:string}.',
				},
				tooManyTickets: {
					title: ERROR_TITLE,
					user: {
						description: 'You have too many active tickets, you may not have more than {amount:number}.',
					},
					proxy: {
						description: '{member:string} has too many active tickets, they may not have more than {amount:number}.',
					},
				},
				invalidFields: {
					title: ERROR_TITLE,
					fields: {
						title: 'The support ticket title must be less than 100 characters long.',
						description: 'The support ticket description must be less than 2000 characters long.',
					},
				},
			},
			ticketCreated: {
				title: 'Ticket Created!',
				notProxy: {
					user: {
						description: 'Your support ticket has been created! View it at {channel:string}.',
					},
					logs: {
						description: '{member:string} has created a ticket! View it at {channel:string}.',
					},
				},
				proxy: {
					user: {
						description: 'The support ticket for {member:string} has been created! View it at {channel:string}.',
					},
					logs: {
						description:
							'{creator:string} created a support ticket by proxy for {member:string}! View it at {channel:string}.',
					},
				},
			},
		},
		actions: {
			_errorIfNotTicketChannel: {
				title: ERROR_TITLE,
				description: 'The channel is not a valid ticket channel.',
			},
			_errorIfNotTicketAuthorOrManager: {
				title: ERROR_TITLE,
				description: 'You need to be the ticket author or manager to execute this action.',
			},
			_errorIfNoAuthorPermissions: {
				title: ERROR_TITLE,
				description: 'You do not have permission to use this action.',
			},
			renameTitle: {
				builder: {
					label: 'Rename Title',
				},
				component: {
					modal: {
						title: 'Rename Thread Title',
						inputs: [
							{
								label: 'Thread Title',
								description: 'Write the new title that should be used for the thread.',
							},
						],
					},
				},
				modal: {
					errors: {
						notEditable: {
							title: ERROR_TITLE,
							description: 'I do not have the permission to edit the title in the thread.',
						},
						tooLong: {
							title: ERROR_TITLE,
							description: 'The title may not be longer than 100 characters.',
						},
					},
					success: {
						title: 'Ticket Renamed',
						user: {
							description: 'The support ticket has been renamed from "{oldTitle:string}" to "{newTitle:string}".',
						},
						logs: {
							description:
								'The support ticket at {thread:string} has been renamed from "{oldTitle:string}" to "{newTitle:string}".',
						},
					},
				},
			},
			lock: {
				builder: {
					label: 'Lock',
				},
				execute: {
					errors: {
						notManageable: {
							title: ERROR_TITLE,
							description: 'I do not have the necessary permission(s) to lock the thread ticket.',
						},
					},
					success: {
						title: 'Ticket Locked',
						user: {
							description: 'The support ticket has been successfully locked!',
						},
						logs: {
							description: 'The support ticket at {thread:string} has been locked by {member:string}.',
						},
					},
				},
			},
			close: {
				builder: {
					label: 'Close',
				},
				execute: {
					errors: {
						notEditable: {
							title: ERROR_TITLE,
							description: 'I do not have the permission to close the ticket.',
						},
					},
					success: {
						title: 'Ticket Closed',
						user: {
							description: 'The support ticket has been successfully closed!',
						},
						logs: {
							description: 'The support ticket at {thread:string} has been closed by {member:string}.',
						},
					},
				},
			},
			lockAndClose: {
				builder: {
					label: 'Lock & Close',
				},
				execute: {
					errors: {
						notManageableAndEditable: {
							title: ERROR_TITLE,
							description: 'I do not have the necessary permission(s) to lock and close the thread ticket.',
						},
					},
					success: {
						title: 'Ticket Locked & Closed',
						user: {
							description: 'The support ticket has been successfully locked and closed!',
						},
						logs: {
							description: 'The support ticket at {thread:string} has been locked and closed by {member:string}.',
						},
					},
				},
			},
			delete: {
				builder: {
					label: 'Delete',
				},
				execute: {
					errors: {
						notManageable: {
							title: ERROR_TITLE,
							description: 'I do not have the necessary permission(s) to delete the thread ticket.',
						},
					},
					success: {
						user: {
							title: 'Deleting Ticket...',
							description: 'I am attempting to delete the support ticket...',
						},
						logs: {
							title: 'Ticket Deleted',
							description:
								'The ticket with the ID {threadId:string} and title "{title:string}" has been deleted by {member:string}.',
						},
					},
				},
			},
		},
		ticketState: {
			active: 'Active',
			archived: 'Closed',
			locked: 'Locked',
			lockedAndArchived: 'Locked and Closed',
		} as Record<typeof ticketsThreads.$inferSelect.state, string>,
	},
};
