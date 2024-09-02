import { ThreadTicketActionsPermissionBitField } from '@ticketer/database';

export const ActionsAsName = {
	rename_title: 'Rename Title',
	lock: 'Lock',
	close: 'Close',
	lock_and_close: 'Lock And Close',
	delete: 'Delete',
} as const;

type Actions = typeof ActionsAsName;
export type KeyOfActions = keyof Actions;

export const ActionsAsKey = (value: Actions[KeyOfActions]) =>
	Object.keys(ActionsAsName).find((key) => ActionsAsName[key as KeyOfActions] === value) as KeyOfActions;

// We are going to be explicit instead of looping through the objects to avoid possible unwanted behaviour.
export const actionsAsKeyAndFlagsMap = new Map([
	[ActionsAsKey(ActionsAsName.rename_title), ThreadTicketActionsPermissionBitField.Flags.RenameTitle],
	[ActionsAsKey(ActionsAsName.lock), ThreadTicketActionsPermissionBitField.Flags.Lock],
	[ActionsAsKey(ActionsAsName.close), ThreadTicketActionsPermissionBitField.Flags.Close],
	[ActionsAsKey(ActionsAsName.lock_and_close), ThreadTicketActionsPermissionBitField.Flags.LockAndClose],
	[ActionsAsKey(ActionsAsName.delete), ThreadTicketActionsPermissionBitField.Flags.Delete],
]);

const actionsAndFlagsMap = new Map([
	[ActionsAsName.rename_title, ThreadTicketActionsPermissionBitField.Flags.RenameTitle],
	[ActionsAsName.lock, ThreadTicketActionsPermissionBitField.Flags.Lock],
	[ActionsAsName.close, ThreadTicketActionsPermissionBitField.Flags.Close],
	[ActionsAsName.lock_and_close, ThreadTicketActionsPermissionBitField.Flags.LockAndClose],
	[ActionsAsName.delete, ThreadTicketActionsPermissionBitField.Flags.Delete],
]);

export function actionsBitfieldToNames(bitfield: number | null) {
	bitfield ??= ThreadTicketActionsPermissionBitField.Default;
	const permissions = new ThreadTicketActionsPermissionBitField(bitfield);
	const names: Actions[KeyOfActions][] = [];

	for (const [name, flag] of actionsAndFlagsMap) {
		if (permissions.has(flag)) {
			names.push(name);
		}
	}

	return names;
}
