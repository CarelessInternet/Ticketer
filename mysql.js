require('dotenv').config();

const connection = require('./db');
const createGuildMemberEvent =
`
CREATE TABLE IF NOT EXISTS GuildMemberEvent (
  ID int NOT NULL AUTO_INCREMENT,
  GuildID bigint(20) NOT NULL UNIQUE,
  ChannelID bigint(20) NOT NULL,
  Enabled boolean NOT NULL,
  PRIMARY KEY (ID)
)
`;
const createTicketingManagers =
`
CREATE TABLE IF NOT EXISTS TicketingManagers (
  ID int NOT NULL AUTO_INCREMENT,
  GuildID bigint(20) NOT NULL UNIQUE,
  RoleID bigint(20) NOT NULL,
  PRIMARY KEY (ID)
)
`;

(async () => {
  try {
    await connection.execute(createGuildMemberEvent);
    await connection.execute(createTicketingManagers);
    console.log('Successfully created all required tables!');
  } catch(err) {
    console.error(err);
  }
})();