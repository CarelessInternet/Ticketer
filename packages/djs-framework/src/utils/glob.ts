import fg from 'fast-glob';

/**
 * Searches through the directories for TypeScript files.
 * @returns All TypeScript file paths found within the directories.
 */
export async function glob(path: string) {
	return fg(`${path}/**/*.ts`);
}
