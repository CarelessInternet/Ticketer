CREATE TABLE `welcomeAndFarewell` (
	`guildId` bigint unsigned NOT NULL,
	`welcomeChannelId` bigint unsigned,
	`welcomeTitle` varchar(100),
	`welcomeMessage` varchar(500),
	`welcomeNewMemberRoles` json NOT NULL DEFAULT ('[]'),
	`welcomeEnabled` boolean NOT NULL DEFAULT true,
	`farewellChannelId` bigint unsigned,
	`farewellTitle` varchar(100),
	`farewellMessage` varchar(500),
	`farewellEnabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `welcomeAndFarewell_guildId` PRIMARY KEY(`guildId`),
	CONSTRAINT `welcomeAndFarewell_welcomeChannelId_unique` UNIQUE(`welcomeChannelId`),
	CONSTRAINT `welcomeAndFarewell_farewellChannelId_unique` UNIQUE(`farewellChannelId`)
);
