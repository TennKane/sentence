CREATE TABLE `sentences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`source` text,
	`tags` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
