CREATE TABLE `buyerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(120),
	`shippingAddress` text,
	`marketplaceUpdates` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buyerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `buyerProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `buyerProfiles_userId_idx` ON `buyerProfiles` (`userId`);