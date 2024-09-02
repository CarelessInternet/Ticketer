import { and, eq } from 'drizzle-orm';
import type { DiscordSnowflake } from '.';
import { database } from '..';
import { ticketThreadsCategories } from '../schema';

export class ThreadTicketActionsPermissionBitField {
	public static Flags = {
		// key: 1 << n (n=0 at initial)
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

	public has(bit: number) {
		return (this.bitfield & bit) === bit;
	}

	public toggle(bit: number) {
		this.bitfield ^= bit;
		return this.has(bit);
	}

	public add(
		...bits: (typeof ThreadTicketActionsPermissionBitField.Flags)[keyof typeof ThreadTicketActionsPermissionBitField.Flags][]
	) {
		let total = 0;

		for (const bit of bits) {
			total |= bit;
		}

		this.bitfield |= total;
	}

	public remove(
		...bits: (typeof ThreadTicketActionsPermissionBitField.Flags)[keyof typeof ThreadTicketActionsPermissionBitField.Flags][]
	) {
		let total = 0;

		for (const bit of bits) {
			total |= bit;
		}

		this.bitfield &= ~total;
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
