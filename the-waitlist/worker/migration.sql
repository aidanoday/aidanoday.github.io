-- Migration: add wait gamification columns and table
-- Run with: npx wrangler d1 execute waitlist-db --file=worker/migration.sql --remote
--
-- NOTE: ALTER TABLE statements will error if the column already exists.
-- Run each statement individually if you need to skip ones already applied.

ALTER TABLE users ADD COLUMN last_cut TEXT;
ALTER TABLE users ADD COLUMN in_queue INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN position_one_start_time TEXT;
ALTER TABLE users ADD COLUMN cuts_in_current_wait INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN current_wait_join_time TEXT;
ALTER TABLE users ADD COLUMN accumulated_wait_seconds INTEGER NOT NULL DEFAULT 0;

-- Backfill current_wait_join_time for existing users
UPDATE users SET current_wait_join_time = signup_time WHERE current_wait_join_time IS NULL;

-- position_one_start_time no longer drives the timer (accumulated_wait_seconds does)
-- but we seed it anyway for any analytics that reference it
UPDATE users SET position_one_start_time = datetime('now') WHERE in_queue = 1 AND position = 1;

ALTER TABLE wait_completions ADD COLUMN waiting_for TEXT;

CREATE TABLE IF NOT EXISTS wait_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  wait_number INTEGER NOT NULL,
  joined_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  high_fives_given INTEGER NOT NULL DEFAULT 0,
  high_fives_received INTEGER NOT NULL DEFAULT 0,
  cuts_made INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
