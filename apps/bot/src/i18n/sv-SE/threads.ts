import type { DeepPartial } from '@/utils';
import ERROR_TITLE from './errorTitle';
import type { Translation } from '../i18n-types';

export default {
	categories: {
		configuration: {
			openingMessage: {
				title: '{category}: Ny Stödbiljett',
				description: '{member} skapade en ny stödbiljett i {category} kategorin!',
			},
		},
		categoryList: {
			placeholder: 'Välj en kategori för att skapa en stödbiljett i.',
		},
		createModal: {
			errors: {
				invalidCustomId: {
					title: ERROR_TITLE,
					description: 'Kategori-ID:t kunde inte hittas.',
				},
			},
			title: {
				label: 'Titel',
				placeholder: 'Skriv en titel som ska användas i stödbiljetten.',
			},
			description: {
				label: 'Beskrivning',
				placeholder: 'Skriv en beskrivning som ska användas i stödbiljetten.',
			},
			modalTitle: 'Stödbiljett Titel & Beskrivning',
		},
		createTicket: {
			errors: {
				invalidUser: {
					title: ERROR_TITLE,
					description: 'En stödbiljett för mig själv kan inte skapas, din dumbom.',
				},
				noCategories: {
					title: ERROR_TITLE,
					description: 'Inga stödbiljettkategorier kunde hittas.',
				},
				invalidId: {
					title: ERROR_TITLE,
					description: 'Kategori-ID:t är inte giltigt.',
				},
				noConfiguration: {
					title: ERROR_TITLE,
					description: 'Den globala eller kategori konfigurationen kunde inte hittas.',
				},
				noManagers: {
					title: ERROR_TITLE,
					description: 'Det finns inga biljettansvariga att lägga till i stödbiljetten.',
				},
				invalidChannel: {
					title: ERROR_TITLE,
					description: 'Stödbiljettkanelen finns inte eller den är inte en textkanal.',
				},
				noPermissions: {
					title: ERROR_TITLE,
					description: 'Jag har inte de nödvändiga behörigheter i kanalen för att skapa en stödbiljett: {permissions}.',
				},
				tooManyTickets: {
					title: ERROR_TITLE,
					user: {
						description: 'Du har för många aktiva stödbiljetter, du får inte ha fler än {amount}.',
					},
					proxy: {
						description: '{member} har för många aktiva stödbiljetter, hen får inte ha fler än {amount}.',
					},
				},
			},
			ticketCreated: {
				title: 'Stödbiljett Skapats!',
				notProxy: {
					user: {
						description: 'Din stödbiljett har skapats! Se den i {channel}.',
					},
					logs: {
						description: '{member} har skapat en stödbiljett! Se den i {channel}.',
					},
				},
				proxy: {
					user: {
						description: 'Stödbiljetten för {member} har skapats! Se den i {channel}.',
					},
					logs: {
						description: '{creator} har skapat en stödbiljett genom ombud för {member}! Se den i {channel}.',
					},
				},
			},
		},
		buttons: {
			_errorIfNotTicketChannel: {
				title: ERROR_TITLE,
				description: 'Kanalen är inte en giltigt stödbiljettkanal.',
			},
			_errorIfNotTicketAuthorOrManager: {
				title: ERROR_TITLE,
				description:
					'Du måste vara stödbiljettägaren eller stödbiljettansvarigt för att köra den/det här knappen/kommandot.',
			},
			renameTitle: {
				builder: {
					label: 'Ändra Titeln',
				},
				component: {
					modal: {
						title: 'Ändra Trådtiteln',
						inputs: [
							{
								label: 'Trådtitel',
								placeholder: 'Skriv den nya titeln som ska användas för tråden.',
							},
						],
					},
				},
				modal: {
					errors: {
						notEditable: {
							title: ERROR_TITLE,
							description: 'Jag har inte behörighet att redigera titeln i trådkanalen.',
						},
					},
					success: {
						title: 'Stödbiljett Ändrade Namn',
						user: {
							description: 'Stödbiljettens titel har ändrats från "{oldTitle}" till "{newTitle}".',
						},
						logs: {
							description: 'Stödbiljetten vid {thread} har bytt namn från "{oldTitle}" till "{newTitle}".',
						},
					},
				},
			},
			lock: {
				builder: {
					label: 'Låsa',
				},
				execute: {
					errors: {
						notManageable: {
							title: ERROR_TITLE,
							description: 'Jag har inte de nödvändiga behörigheter för att låsa trådkanalen.',
						},
					},
					success: {
						title: 'Stödbiljett Låst',
						user: {
							description: 'Stödbiljetten var låst framgångsrikt!',
						},
						logs: {
							description: 'Stödbiljetten vid {thread} har låsts av {member}.',
						},
					},
				},
			},
			close: {
				builder: {
					label: 'Stänga',
				},
				execute: {
					errors: {
						notEditable: {
							title: ERROR_TITLE,
							description: 'Jag har inte behörighet att stänga stödbiljetten.',
						},
					},
					success: {
						title: 'Stödbiljett Stängt',
						user: {
							description: 'Stödbiljetten stängdes framgångsrikt!',
						},
						logs: {
							description: 'Stödbiljetten vid {thread} har stängts av {member}.',
						},
					},
				},
			},
			lockAndClose: {
				builder: {
					label: 'Låsa & Stänga',
				},
				execute: {
					errors: {
						notManageableAndEditable: {
							title: ERROR_TITLE,
							description: 'Jag har inte de nödvändiga behörigheter för att låsa och stänga trådkanalen.',
						},
					},
					success: {
						title: 'Stödbiljett Låst & Stängt',
						user: {
							description: 'Stödbiljetten var låst och stängt framgångsrikt!',
						},
						logs: {
							description: 'Stödbiljetten vid {thread} har låsts och stängs av {member}.',
						},
					},
				},
			},
			delete: {
				builder: {
					label: 'Radera',
				},
				execute: {
					errors: {
						notManageable: {
							title: ERROR_TITLE,
							description: 'Jag har inte de nödvändiga behörigheter för att låsa trådkanalen.',
						},
					},
					success: {
						user: {
							title: 'Raderar Stödbiljett...',
							description: 'Jag försöker att radera stödbiljetten.',
						},
						logs: {
							title: 'Stödbiljett Raderat',
							description: 'Stödbiljetten med ID:t {threadId} och titeln "{title}" har raderats av {member}.',
						},
					},
				},
			},
		},
		ticketState: {
			active: 'Aktiv',
			archived: 'Stängt',
			locked: 'Låst',
			lockedAndArchived: 'Låst och Stängt',
		},
	},
} satisfies DeepPartial<Translation['tickets']['threads']>;
