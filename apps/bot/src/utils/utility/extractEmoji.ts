// https://stackoverflow.com/a/69115223
const emojiRegex = /\p{RGI_Emoji}/gv;

export const extractEmoji = (emoji?: string) =>
	emoji && emojiRegex.test(emoji) ? emoji.match(emojiRegex)?.at(0) : undefined;
