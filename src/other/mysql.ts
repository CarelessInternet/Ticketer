import { config } from 'dotenv';
config();

import { green, red } from 'chalk';
import { conn } from '../utils';

const createGuildMemberEvent = `
CREATE TABLE IF NOT EXISTS GuildMemberEvent (
  ID int NOT NULL AUTO_INCREMENT,
  GuildID bigint(20) NOT NULL UNIQUE,
  ChannelID bigint(20) NOT NULL,
  Enabled boolean NOT NULL DEFAULT 1,
  PRIMARY KEY (ID)
)
`;

const createTicketingManagers = `
CREATE TABLE IF NOT EXISTS TicketingManagers (
  ID int NOT NULL AUTO_INCREMENT,
  GuildID bigint(20) NOT NULL UNIQUE,
  RoleID bigint(20) NOT NULL,
  SupportChannel bigint(20) DEFAULT 0,
  Notes text(2500),
  LogsChannel bigint(20) DEFAULT 0,
  SupportCategory bigint(20) DEFAULT 0,
  UseTextChannels boolean DEFAULT 0,
  TextChannelPing boolean DEFAULT 0,
  ReplyEmbed boolean DEFAULT 1,
  PRIMARY KEY (ID)
)
`;

const createSuggestions = `
CREATE TABLE IF NOT EXISTS Suggestions (
  ID int NOT NULL AUTO_INCREMENT,
  GuildID bigint(20) NOT NULL UNIQUE,
  SuggestionsChannel bigint(20) NOT NULL,
  Target smallint NOT NULL DEFAULT 10,
  ReplyEmbed boolean NOT NULL DEFAULT 1,
  BlockedUsers JSON NOT NULL DEFAULT (JSON_ARRAY()),
  PRIMARY KEY (ID)
)
`;

(async () => {
	try {
		await Promise.all([
			conn.execute(createGuildMemberEvent),
			conn.execute(createTicketingManagers),
			conn.execute(createSuggestions)
		]);

		console.log(green('Successfully created/added all required MySQL tables!'));
		process.exit(0);
	} catch (err) {
		console.error(red(err));
	}
})();
