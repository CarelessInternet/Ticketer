import { Event } from '@ticketer/djs-framework';
import chalk from 'chalk';
import { ActivityType, PresenceUpdateStatus } from 'discord.js';
import { formatDateLong, LogExceptions } from '@/utils';

export default class extends Event.Handler {
	public readonly once = true;
	public readonly name = Event.Name.ClientReady;

	@LogExceptions
	public execute([client]: Event.ArgumentsOf<this['name']>) {
		client.user.setPresence({
			activities: [{ name: `🏌️‍♂️ • /help | Shard #${String(client.shard?.ids.at(0) ?? 0)}`, type: ActivityType.Playing }],
			status: PresenceUpdateStatus.Online,
		});

		console.log(
			chalk.blue('[Client]'),
			`Logged in as ${chalk.blueBright(client.user.tag)} on`,
			chalk.yellow(`shard #${String(client.shard?.ids.at(0) ?? 0)}`),
			`on ${formatDateLong()}.`,
		);
	}
}
