import type { Translation } from '../i18n-types.js';

const ERROR_TITLE = 'Ett Fel Uppstod';

const sv_SE = {
	commands: {
		close: {
			data: {
				name: 'stäng',
				description: 'Stänga/Arkivera trådstödbiljetten.',
			},
		},
		delete: {
			data: {
				name: 'radera',
				description: 'Radera trådstödbiljetten.',
			},
		},
		help: {
			data: {
				name: 'hjälp',
				description: 'Visa alla tillgängliga kommandon.',
				options: [
					{
						name: 'gömd',
						description: 'Huruvida meddelandet ska visas till dig eller alla.',
					},
				],
			},
			command: {
				embeds: [
					{
						title: 'Kommandolista',
						description: 'Här är listan över de tillgängliga kommandona: {commands}.',
						fields: [
							{
								name: '🔗 Länkar',
								links: {
									invite: 'Inbjudningslänk',
									supportServer: 'Stödserver',
								},
							},
						],
					},
				],
			},
		},
		lock: {
			data: {
				name: 'låsa',
				description: 'Låsa trådstödbiljetten.',
			},
		},
		migrate: {
			data: {
				name: 'migrera',
				description: 'Tillämpa någon databas migrationer som behövs.',
			},
			command: {
				success: 'Databasen har migrerats framgångsrikt!',
			},
		},
		ping: {
			data: {
				name: 'ping',
				description: 'Visa accesstiden och statusen av boten.',
			},
			command: {
				embeds: [
					{
						title: 'Pingar...',
					},
					{
						title: 'Resultat',
						fields: [
							{
								name: 'Ping',
								value: '⌛ {ms}ms',
							},
							{
								name: 'Latens',
								value: '🏓 Ungefär {ms}ms',
							},
							{
								name: 'WebSocket Status',
								value: '⚙️ {status}',
							},
						],
					},
				],
			},
		},
		purge: {
			data: {
				name: 'rensa',
				description: 'Radera de senaste meddelandena i den nuvarande kanalen med det angivna beloppet.',
				options: [
					{
						name: 'antal',
						description: 'Antalet meddelanden som ska raderas.',
					},
				],
			},
			command: {
				embeds: [
					{
						title: 'Rensade Meddelandena',
						description: 'Raderade de sista {amount} meddelanden!',
					},
				],
			},
		},
		'rename-title': {
			data: {
				name: 'ändra-titel',
				description: 'Ändra titeln på trådstödbiljetten.',
			},
		},
		ticket: {
			data: {
				name: 'biljett',
				description: 'Skapa en stödbiljett inom en kategori.',
			},
		},
	},
	events: {
		interactionCreate: {
			ownerOnly: {
				error: 'Du måste vara botens ägare för att köra kommandot!',
			},
		},
		guildMemberAdd: {
			welcome: {
				title: 'Välkommen {member}!',
				message: '{member} Tack för att du gick med på servern!',
			},
			farewell: {
				title: 'Hejdå {member}!',
				message: '{member} har lämnat servern.',
			},
		},
	},
	tickets: {
		threads: {
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
							description:
								'Jag har inte de nödvändiga behörigheter i kanalen för att skapa en stödbiljett: {permissions}.',
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
							'Du måste vara stödbiljettägaren eller stödbiljettansvarig för att köra den här knappen/kommandot.',
					},
					renameTitle: {
						builder: {
							label: 'Ändra Titeln',
						},
						component: {
							modalTitle: 'Ändra Trådtiteln',
						},
						modal: {
							errors: {
								notEditable: {
									title: ERROR_TITLE,
									description: 'Jag har inte behörighet att redigera titeln.',
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
									description: 'Jag har inte de nödvändiga behörigheter för att låsa kanalen.',
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
					delete: {
						builder: {
							label: 'Radera',
						},
						execute: {
							errors: {
								notManageable: {
									title: ERROR_TITLE,
									description: 'Jag har inte de nödvändiga behörigheter för att låsa kanalen.',
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
			},
		},
	},
} satisfies Translation;

export default sv_SE;
