import { sql, type ticketThreadsCategories } from '@ticketer/database';
import type { GuildMemberRoleManager } from 'discord.js';

type ManagerColumn = typeof ticketThreadsCategories.managers;

/**
 * Finds where the manager's guild role(s) can be found in the manager JSON array.
 */
export const managerIntersection = (managerColumn: ManagerColumn, roles: GuildMemberRoleManager) =>
	// We do this to not accidentally display tickets not belonging to the manager's role(s),
	// as well as avoiding duplicate results as a result of that.
	sql`JSON_OVERLAPS(${managerColumn}, '${sql.raw(JSON.stringify([...roles.cache.keys()]))}')`;
