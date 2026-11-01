CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`edition` text NOT NULL,
	`mode` text NOT NULL,
	`started_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `runs_expiry` ON `runs` (`expires_at`);--> statement-breakpoint
CREATE INDEX `runs_started` ON `runs` (`started_at`);--> statement-breakpoint
CREATE TABLE `scores` (
	`run_id` text PRIMARY KEY NOT NULL,
	`edition` text NOT NULL,
	`mode` text NOT NULL,
	`nickname` text NOT NULL,
	`score` integer NOT NULL,
	`level` integer NOT NULL,
	`finished_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `scores_ranking` ON `scores` (`edition`,`mode`,`score`,`finished_at`);