import { ActivityType, PresenceUpdateStatus } from 'discord.js';
import { Event } from '@ticketer/djs-framework';
import chalk from 'chalk';
import { formatDate } from '@/utils';

export default class extends Event.Handler {
	public readonly once = true;
	public readonly name = Event.Name.ClientReady;

	public execute([client]: Event.ArgumentsOf<this['name']>) {
		client.user.setPresence({
			activities: [{ name: `Playing 🏌️‍♂️ | Shard #${client.shard?.ids.at(0) ?? 0}`, type: ActivityType.Custom }],
			status: PresenceUpdateStatus.Online,
		});

		console.log(
			chalk.blue('[Client]'),
			`Logged in as ${chalk.blueBright(client.user.tag)} at ${formatDate(new Date())} on`,
			chalk.yellow(`shard #${client.shard?.ids.at(0)}.`),
		);
	}
}
