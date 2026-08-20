CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `cartItems_cart_product_unq` UNIQUE(`cartId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`),
	CONSTRAINT `carts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`sellerId` int NOT NULL,
	`productName` varchar(160) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`reference` varchar(32) NOT NULL,
	`status` enum('pending','confirmed','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(10,2) NOT NULL,
	`shippingAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL,
	`shippingAddress` text NOT NULL,
	`paymentStatus` enum('not_required','placeholder','paid','refunded') NOT NULL DEFAULT 'placeholder',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`imageUrl` text,
	`status` enum('draft','pending','published','archived') NOT NULL DEFAULT 'draft',
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderItemId` int NOT NULL,
	`productId` int NOT NULL,
	`sellerId` int NOT NULL,
	`buyerId` int NOT NULL,
	`rating` int NOT NULL,
	`body` text,
	`isVisible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_orderItemId_unique` UNIQUE(`orderItemId`)
);
--> statement-breakpoint
CREATE TABLE `sellerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shopName` varchar(120) NOT NULL,
	`shopDescription` text,
	`isApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sellerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `sellerProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `cartItems_cartId_idx` ON `cartItems` (`cartId`);--> statement-breakpoint
CREATE INDEX `orderItems_orderId_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `orderItems_sellerId_idx` ON `orderItems` (`sellerId`);--> statement-breakpoint
CREATE INDEX `orders_buyerId_idx` ON `orders` (`buyerId`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `products_sellerId_idx` ON `products` (`sellerId`);--> statement-breakpoint
CREATE INDEX `products_categoryId_idx` ON `products` (`categoryId`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `reviews_productId_idx` ON `reviews` (`productId`);--> statement-breakpoint
CREATE INDEX `reviews_sellerId_idx` ON `reviews` (`sellerId`);--> statement-breakpoint
CREATE INDEX `reviews_buyerId_idx` ON `reviews` (`buyerId`);--> statement-breakpoint
CREATE INDEX `sellerProfiles_userId_idx` ON `sellerProfiles` (`userId`);