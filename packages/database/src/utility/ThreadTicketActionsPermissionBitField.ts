import { and, eq } from 'drizzle-orm';
import { database } from '..';
import { ticketThreadsCategories } from '../schema';
import type { DiscordSnowflake } from '.';

export class ThreadTicketActionsPermissionBitField {
	public static Flags = {
		// key: 1 << n (n=0 at initial).
		RenameTitle: 1,
		Lock: 2,
		Close: 4,
		LockAndClose: 8,
		Delete: 16,
	} as const;

	public static All = Object.values(this.Flags).reduce((permissionBit, accumulator) => permissionBit | accumulator, 0);

	public static Default = this.All;

	private bitfield: number;

	public constructor(bitfield?: typeof ThreadTicketActionsPermissionBitField.Default | null) {
		this.bitfield = bitfield ?? ThreadTicketActionsPermissionBitField.Default;
	}

	public get permissions() {
		return this.bitfield;
	}

	public has(bit: number) {
		return (this.bitfield & bit) === bit;
	}

	public toggle(bit: number) {
		this.bitfield ^= bit;
		return this.has(bit);
	}

	public set(bit: number) {
		this.bitfield |= bit;
		return this.has(bit);
	}

	public clear(bit: number) {
		this.bitfield &= ~bit;
		return this.has(bit);
	}

	public updateAuthorPermissions(
		categoryId: typeof ticketThreadsCategories.$inferSelect.id,
		guildId: DiscordSnowflake,
	) {
		return database
			.update(ticketThreadsCategories)
			.set({ allowedAuthorActions: this.bitfield })
			.where(and(eq(ticketThreadsCategories.id, categoryId), eq(ticketThreadsCategories.guildId, guildId)));
	}
}
