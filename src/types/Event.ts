import type { ClientEvents } from 'discord.js';
import type { Client } from '.';

export interface Event {
	name: keyof ClientEvents;
	// can't get automatic intellisense for rest of args, have to manually specify them
	// in each event file. only implementation i can think if is having the name in the execute
	// function and using keyof ClientEvents[name], but that's silly and unnecessary
	execute: (client: Client, ...args: any[]) => Promise<void> | void;
}
