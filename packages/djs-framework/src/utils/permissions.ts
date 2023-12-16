import { PermissionFlagsBits } from 'discord.js';

export type PermissionFlagsKeys = keyof typeof PermissionFlagsBits;

export type PermissionFlagsValues = (typeof PermissionFlagsBits)[PermissionFlagsKeys];

export const getPermissionByValue = (value: PermissionFlagsValues) =>
	Object.keys(PermissionFlagsBits).find((key) => PermissionFlagsBits[key as PermissionFlagsKeys] === value);
