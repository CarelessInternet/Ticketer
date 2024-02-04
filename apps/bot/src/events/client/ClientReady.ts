import { ActivityType, PresenceUpdateStatus } from 'discord.js';
import { LogExceptions, formatDateLong } from '@/utils';
import { Event } from '@ticketer/djs-framework';
import chalk from 'chalk';

export default class extends Event.Handler {
	public readonly once = true;
	public readonly name = Event.Name.ClientReady;

	@LogExceptions
	public execute([client]: Event.ArgumentsOf<this['name']>) {
		client.user.setPresence({
			activities: [{ name: `Playing 🏌️‍♂️ | Shard #${client.shard?.ids.at(0) ?? 0}`, type: ActivityType.Custom }],
			status: PresenceUpdateStatus.Online,
		});

		console.log(
			chalk.blue('[Client]'),
			`Logged in as ${chalk.blueBright(client.user.tag)} on ${formatDateLong(new Date())} on`,
			chalk.yellow(`shard #${client.shard?.ids.at(0)}.`),
		);
	}
}
