// SPDX-License-Identifier: GPL-2.0-or-later
import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const runs=sqliteTable('runs',{
  id:text('id').primaryKey(),tokenHash:text('token_hash').notNull(),
  edition:text('edition').notNull(),mode:text('mode').notNull(),
  difficulty:text('difficulty').notNull().default('normal'),
  startedAt:integer('started_at').notNull(),expiresAt:integer('expires_at').notNull(),
},t=>[index('runs_expiry').on(t.expiresAt),index('runs_started').on(t.startedAt)]);
export const scores=sqliteTable('scores',{
  runId:text('run_id').primaryKey(),edition:text('edition').notNull(),mode:text('mode').notNull(),
  difficulty:text('difficulty').notNull().default('normal'),
  nickname:text('nickname').notNull(),score:integer('score').notNull(),
  level:integer('level').notNull(),finishedAt:integer('finished_at').notNull(),
},t=>[index('scores_ranking').on(t.edition,t.mode,t.difficulty,t.score,t.finishedAt)]);
