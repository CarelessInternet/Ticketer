export const capitalise = <T extends string>(text: T) =>
	text.replace(/./, (character) => character.toUpperCase()) as Capitalize<T>;
