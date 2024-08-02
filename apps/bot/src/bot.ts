import { GatewayIntentBits, Options } from 'discord.js';
import { Client } from '@ticketer/djs-framework';
import { environment } from '@ticketer/env/bot';
import { fileURLToPath } from 'node:url';

const interval = 60;
const filter = () => () => true;

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
	sweepers: {
		...Options.DefaultSweeperSettings,
		// Periodically sweep the caches we do not need.
		autoModerationRules: { filter, interval },
		bans: { filter, interval },
		invites: { filter, interval },
		presences: { filter, interval },
		reactions: { filter, interval },
		stageInstances: { filter, interval },
		stickers: { filter, interval },
		voiceStates: { filter, interval },
	},
});

await client.initialize(
	fileURLToPath(new URL('events', import.meta.url)),
	fileURLToPath(new URL('commands', import.meta.url)),
);

void client.login(environment.DISCORD_BOT_TOKEN);
