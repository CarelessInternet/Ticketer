CREATE TABLE `ticketForumsConfiguration` (
	`guildId` bigint unsigned NOT NULL,
	`channelId` bigint unsigned NOT NULL,
	`managers` json NOT NULL DEFAULT ('[]'),
	`openingMessageTitle` varchar(100),
	`openingMessageDescription` varchar(500),
	CONSTRAINT `ticketForumsConfiguration_guildId` PRIMARY KEY(`guildId`)
);
--> statement-breakpoint
CREATE TABLE `ticketThreadsCategories` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`guildId` bigint unsigned NOT NULL,
	`categoryEmoji` char,
	`categoryTitle` varchar(100),
	`categoryDescription` varchar(100),
	`channelId` bigint unsigned,
	`logsChannelId` bigint unsigned,
	`managers` json NOT NULL DEFAULT ('[]'),
	`privateThreads` boolean NOT NULL DEFAULT true,
	`ticketTitle` varchar(100),
	`ticketDescription` varchar(500),
	CONSTRAINT `ticketThreadsCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticketThreadsConfiguration` (
	`guildId` bigint unsigned NOT NULL,
	`activeTickets` tinyint unsigned NOT NULL DEFAULT 1,
	`threadNotifications` boolean NOT NULL DEFAULT false,
	CONSTRAINT `ticketThreadsConfiguration_guildId` PRIMARY KEY(`guildId`)
);
--> statement-breakpoint
CREATE TABLE `ticketsThreads` (
	`threadId` bigint unsigned NOT NULL,
	`authorId` bigint unsigned NOT NULL,
	`categoryId` int unsigned NOT NULL,
	`guildId` bigint unsigned NOT NULL,
	CONSTRAINT `ticketsThreads_threadId` PRIMARY KEY(`threadId`)
);
--> statement-breakpoint
CREATE TABLE `welcomeAndFarewell` (
	`guildId` bigint unsigned NOT NULL,
	`welcomeChannelId` bigint unsigned,
	`welcomeMessageTitle` varchar(100),
	`welcomeMessageDescription` varchar(500),
	`welcomeNewMemberRoles` json NOT NULL DEFAULT ('[]'),
	`welcomeEnabled` boolean NOT NULL DEFAULT true,
	`farewellChannelId` bigint unsigned,
	`farewellMessageTitle` varchar(100),
	`farewellMessageDescription` varchar(500),
	`farewellEnabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `welcomeAndFarewell_guildId` PRIMARY KEY(`guildId`),
	CONSTRAINT `welcomeAndFarewell_welcomeChannelId_unique` UNIQUE(`welcomeChannelId`),
	CONSTRAINT `welcomeAndFarewell_farewellChannelId_unique` UNIQUE(`farewellChannelId`)
);
--> statement-breakpoint
CREATE INDEX `guildId_index` ON `ticketThreadsCategories` (`guildId`);--> statement-breakpoint
CREATE INDEX `authorId_index` ON `ticketsThreads` (`authorId`);--> statement-breakpoint
CREATE INDEX `categoryId_index` ON `ticketsThreads` (`categoryId`);--> statement-breakpoint
CREATE INDEX `guildId_index` ON `ticketsThreads` (`guildId`);--> statement-breakpoint
ALTER TABLE `ticketThreadsCategories` ADD CONSTRAINT `ticket_threads_categories_fk` FOREIGN KEY (`guildId`) REFERENCES `ticketThreadsConfiguration`(`guildId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticketsThreads` ADD CONSTRAINT `tickets_threads_fk` FOREIGN KEY (`guildId`,`categoryId`) REFERENCES `ticketThreadsCategories`(`guildId`,`id`) ON DELETE no action ON UPDATE no action;