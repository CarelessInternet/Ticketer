import type { DeepPartial } from '@/utils';
import ERROR_TITLE from './errorTitle';
import type { Translation } from '../i18n-types';
import automaticThreads from './automaticThreads';
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
								name: '❓ Hur kommer man igång?',
								value: 'Letar du efter hur man konfigurerar boten? Klicka på "Kommandodokumentation" länken nedan.',
							},
							{
								name: '🔗 Länkar',
								links: {
									commandDocumentation: 'Kommandodokumentation',
									invite: 'Inbjudningslänk',
									supportServer: 'Stödserver',
									website: 'Webbsida',
								},
							},
						],
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
		'proxy-ticket-chat': {
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
		'proxy-ticket-user': {
			data: {
				name: 'Skapa Stödbiljett genom Ombud',
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
						description: 'Raderade de{{t|}} sista {amount} meddelande{{t|n}}!',
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
