import type { Translation } from '../i18n-types.js';

const sv_SE = {
	commands: {
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
} satisfies Translation;

export default sv_SE;
