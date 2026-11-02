DROP INDEX `scores_ranking`;--> statement-breakpoint
ALTER TABLE `scores` ADD `difficulty` text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
CREATE INDEX `scores_ranking` ON `scores` (`edition`,`mode`,`difficulty`,`score`,`finished_at`);--> statement-breakpoint
ALTER TABLE `runs` ADD `difficulty` text DEFAULT 'normal' NOT NULL;