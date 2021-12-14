import { Client as BotClient, ClientOptions, Collection } from 'discord.js';
import { Command } from './index';

export class Client extends BotClient {
	public commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);

		this.commands = new Collection();
	}
}
