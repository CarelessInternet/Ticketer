import type { DeepPartial } from '@/utils';
import type { Translation } from '../i18n-types';
import automaticThreads from './automaticThreads';
import ERROR_TITLE from './errorTitle';
import threads from './threads';
import userForums from './userForums';

const sv_SE = {
	commands: {
		'bot-custom-status': {
			data: {
				name: 'bot-anpassad-status',
				description: 'Ändra botens (shard) anpassad status.',
				options: [
					{
						name: 'anpassad-status',
						description: 'Den nya anpassade statusen som boten (shard) ska visa. Skriv "[shardId]" för shards ID.',
					},
					{
						name: 'visningsstatusen',
						description: 'Den visningsstatusen som boten (shard) ska visa.',
						choices: {
							DoNotDisturb: 'Stör Ej',
							Idle: 'Inaktiv',
							Invisible: 'Osynlig',
							Online: 'Online',
						},
					},
				],
			},
			command: {
				embeds: [
					{
						title: 'Uppdaterat Statusen!',
						description: 'Botens status har uppdaterats!',
					},
				],
			},
		},
		'bot-profile': {
			data: {
				name: 'bot-profil',
				description: 'Ändra botens profil på den här servern.',
			},
			command: {
				container: {
					heading: 'Nedan finns konfiguationer du kan redigera:',
					menu: {
						placeholder: 'Välj ett fält att ändra.',
						name: {
							label: 'Användarnamn',
							description: 'Ändra mitt namn på servern.',
						},
						bio: {
							label: 'Bio',
							description: 'Ändra min bio på servern.',
						},
						avatar: {
							label: 'Profilbild',
							description: 'Ändra min profilbild på servern.',
						},
						banner: {
							label: 'Banner',
							description: 'Ändra min banner på servern.',
						},
					},
				},
				modals: {
					errors: {
						select: {
							title: ERROR_TITLE,
							description: 'Det valda värdet kunde inte hittas.',
						},
						customId: {
							title: ERROR_TITLE,
							description: 'Modal-ID kunde inte hittas.',
						},
					},
					name: {
						input: {
							title: 'Ändra namn',
							labels: [
								{
									label: 'Smeknamn',
									description: 'Lämna fältet tomt för att återställa namnet.',
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
									description: 'Jag behöver rättigheten Ändra Smeknamn för att kunna ändra mitt smeknamn.',
								},
							},
							success: {
								heading: 'Namn Ändrat',
								content: '{member} ändrade mitt användarnamn från {oldName} till {newName}.',
							},
						},
					},
					bio: {
						input: {
							title: 'Ändra Bio',
							labels: [
								{
									label: 'Om Mig*',
									description: '* Bion kan inte återställas till standard!',
								},
							],
						},
						response: {
							errors: {
								validation: { title: ERROR_TITLE },
							},
							success: {
								heading: 'Bio Ändrad',
								content: {
									withBio: '{member} ändrade min bio till:',
									withoutBio: '{member} ändrade min bio till ingenting.',
								},
							},
						},
					},
					avatar: {
						input: {
							title: 'Ändra Profilbild',
							labels: [
								{
									label: 'Profilbild',
									description: 'Lämna fältet tomt för att återställa profilbilden.',
								},
							],
						},
						response: {
							errors: {
								unknown: {
									title: ERROR_TITLE,
									description: 'Profilbilden kunde inte användas av okänd anledning.',
								},
							},
							success: {
								heading: 'Avatar Ändrad',
								content: '{member} ändrade min profilbild från bilden till vänster till den till höger.',
							},
						},
					},
					banner: {
						input: {
							title: 'Ändra Banner',
							labels: [
								{
									label: 'Banner',
									description: 'Lämna fältet tomt för att återställa bannern.',
								},
							],
						},
						response: {
							errors: {
								unknown: {
									title: ERROR_TITLE,
									description: 'Bannern kunde inte användas av okänd anledning.',
								},
							},
							success: {
								heading: 'Banner Ändrad',
								content: {
									oldAndNew: '{member} ändrade min banner från bilden till vänster till den till höger.',
									oldAndNoNew: '{member} ändrade min banner från bilden nedan till standard.',
									noOldAndNew: '{member} ändrade min banner från standardbilden till den nedan.',
									noOldAndNoNew: '{member} ändrade min banner från standardbilden till standardbilden.',
								},
							},
						},
					},
				},
			},
		},
		'bot-statistics': {
			data: {
				name: 'bot-statistik',
				description: 'Visa statistiken av boten.',
				options: [
					{
						name: 'gömd',
						description: 'Huruvida meddelandet ska visas till dig eller alla.',
					},
				],
			},
			command: {
				errors: {
					noShard: {
						title: ERROR_TITLE,
						description: 'Ingen partition for boten kunde hittas.',
					},
				},
				embeds: [
					{
						title: 'Bot Statistik',
						description: 'Datan nedan visar information om botens statistik.',
						fields: [
							'Cachad Användare',
							'Kanaler + Trådar',
							'Kanaler - Trådar',
							'Emojis',
							'Servrar',
							'Servermedlemmar',
							'Individuella Partitioner',
						],
						fallbackFieldValue: 'Okänd',
						shardsStats: ['Partition', 'Ping', 'RAM-användande', 'Servrar', 'Status', 'Upp Sedan', 'Medlemsantal'],
					},
				],
			},
		},
		close: {
			data: {
				name: 'stänga',
				description: 'Stänga/Arkivera tråden eller trådstödbiljetten.',
			},
		},
		delete: {
			data: {
				name: 'radera',
				description: 'Radera tråden eller trådstödbiljetten.',
			},
		},
		'guild-blacklist': {
			data: {
				name: 'server-svartlista',
				description: 'Hantera svartlistor av servrar.',
				subcommands: [
					{
						name: 'översikt',
						description: 'Visa alla svartlistor av servrar.',
					},
					{
						name: 'tillägga',
						description: 'Lägg till en svartlista av en server.',
						options: [
							{
								name: 'id',
								description: 'ID för servern som ska svartlistas.',
							},
							{
								name: 'anlendning',
								description: 'Anledningen för svartlistningen av servern.',
							},
						],
					},
					{
						name: 'radera',
						description: 'Ta bort en svartlista av server.',
						options: [
							{
								name: 'id',
								description: 'ID för servern som ska vitlistas.',
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
						title: 'Server {id}',
						fields: [
							{
								name: 'Anledning',
							},
							{
								name: 'Datum',
							},
						],
					},
					create: {
						title: 'Svartlistade en Server',
						description: 'Servern med ID:t {id} har svartlistats.',
						fields: [
							{
								name: 'Anledning',
							},
							{
								name: 'Datum',
							},
						],
					},
					delete: {
						title: 'Raderade en Server Svartlista',
						description: '{member} vitlistated servern med ID:t {id}',
					},
				},
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
				components: [
					{
						button: {
							label: 'Kommandodokumentation',
						},
						text: [
							{
								content: '❗ Kommandolista',
							},
						],
					},
					{
						text: '🔗 Länkar',
					},
					{
						links: { donate: 'Donera', invite: 'Inbjudningslänk', supportServer: 'Stödserver', website: 'Webbsida' },
					},
				],
			},
		},
		'lock-and-close': {
			data: {
				name: 'låsa-och-stänga',
				description: 'Låsa och stänga tråden eller trådstödbiljetten.',
			},
		},
		lock: {
			data: {
				name: 'låsa',
				description: 'Låsa tråd eller trådstödbiljetten.',
			},
		},
		migrate: {
			data: {
				name: 'migrera',
				description: 'Tillämpa någon databas migrationer som behövs.',
			},
			command: {
				embeds: [
					{
						title: 'Migrerade!',
						description: 'Databasen har migrerats framgångsrikt!',
					},
				],
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
						title: ERROR_TITLE,
						description: 'Ett fel uppstod vid försök att ta emot det besvarade meddelandet.',
					},
					{
						title: 'Resultat',
						fields: [
							{
								name: 'Ping',
								value: '⌛ {ms} ms',
							},
							{
								name: 'Latens',
								value: '🏓 Ungefär {ms} ms',
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
		'proxy-ticket': {
			chat: {
				data: {
					name: 'ombud-stödbiljett',
					description: 'Skapa en stödbiljett genom ombud för en medlem.',
					options: [
						{
							name: 'medlem',
							description: 'Medlemmen som du vill skapa en stödbiljett för.',
						},
					],
				},
			},
			'context-user': {
				data: {
					name: 'Skapa Stödbiljett genom Ombud',
				},
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
						title: {
							success: 'Rensade Meddelandena',
							error: ERROR_TITLE,
						},
						description: {
							success: 'Raderade de{{t|}} sista {amount} meddelande{{t|n}}!',
							error:
								'Jag behöver Se kanal, Läs meddelandehistoriken, och Hantera meddelanden behörigheten för att radera meddelanden.',
						},
					},
				],
			},
		},
		'rename-title': {
			data: {
				name: 'ändra-titel',
				description: 'Ändra titeln på tråden eller trådstödbiljetten.',
			},
		},
		'show-tickets': {
			data: {
				name: 'visa-stödbiljett',
				description: 'Visa stödbiljetterna som du har i servern.',
				options: [
					{
						name: 'läge',
						description: 'Filtrera efter stödbiljetternas lägen.',
					},
				],
			},
			command: {
				buttons: {
					previous: {
						label: 'Föregående Sida',
					},
					next: {
						label: 'Nästa Sida',
					},
				},
				content: 'Antalet stödbiljetter av dig i servern: {amount}.',
				embeds: [
					{
						fields: [
							{
								name: 'Trådkanal',
							},
							{
								name: 'Läge',
							},
						],
					},
				],
			},
		},
		ticket: {
			data: {
				name: 'stödbiljett',
				description: 'Skapa en stödbiljett inom en kategori.',
			},
		},
		'view-user-tickets': {
			chat: {
				data: {
					name: 'visa-användare-stödbiljetter',
					description: 'Visa en användarens trådstödbiljetter.',
					options: [
						{
							name: 'medlem',
							description: 'Medlemmens vars stödbiljetter du vill se.',
						},
					],
				},
			},
			'context-user': {
				data: {
					name: 'Visa Användarens Stödbiljetter',
				},
			},
			common: {
				command: {
					content: 'Det totala beloppet av stödbiljetter från {member} i servern: {amount}.',
					embeds: [
						{
							fields: [
								{
									name: 'Trådkanal',
								},
								{
									name: 'Läge',
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
				description: 'Denna server har blivit svartlistad från att använda boten!',
				fields: [
					{
						name: 'Anledningen',
					},
					{
						name: 'Datum',
					},
				],
			},
			ownerOnly: {
				title: ERROR_TITLE,
				description: 'Du måste vara botens ägare för att köra kommandot!',
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
		threadMembersUpdate: {
			logs: {
				title: 'Stödbiljettsägare lämnade',
				description:
					'{member} lämnade tråden vid {thread} och därför har stödbiljetten {state|{lock: låsts, close: stängts, lockAndClose: låsts och stängts, delete: raderats}}.',
			},
		},
	},
	miscellaneous: {
		paginationButtons: {
			next: {
				label: 'Nästa Sida',
			},
			previous: {
				label: 'Föregående Sida',
			},
		},
	},
	tickets: {
		errors: {
			invalidTicket: {
				title: ERROR_TITLE,
				description: 'Du får inte redigera tråden eller stödbiljetten i den här kanalen.',
			},
		},
		automaticThreads,
		threads,
		userForums,
	},
} satisfies DeepPartial<Translation>;

export default sv_SE;
