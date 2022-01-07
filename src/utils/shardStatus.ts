import { Status } from 'discord.js';

/**
 * Returns string form of the status of a shard
 * @param status - The status of the shard
 * @link https://discord.js.org/#/docs/main/stable/typedef/Status
 */
export const shardStatus = (status: Status) => {
	switch (status) {
		case 0:
			return 'READY';
		case 1:
			return 'CONNECTING';
		case 2:
			return 'RECONNECTING';
		case 3:
			return 'IDLE';
		case 4:
			return 'NEARLY';
		case 5:
			return 'DISCONNECTED';
		case 6:
			return 'WAITING_FOR_GUILDS';
		case 7:
			return 'IDENTIFYING';
		case 8:
			return 'RESUMING';
		default:
			return 'UNKNOWN';
	}
};
