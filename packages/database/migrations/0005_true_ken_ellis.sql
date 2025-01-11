CREATE TABLE `guildBlacklists` (
	`guildId` bigint unsigned NOT NULL,
	`reason` varchar(500) NOT NULL,
	`timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `guildBlacklists_guildId` PRIMARY KEY(`guildId`)
);
--> statement-breakpoint
CREATE INDEX `timestamp_index` ON `guildBlacklists` (`timestamp`);