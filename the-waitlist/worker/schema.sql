CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  position INTEGER NOT NULL,
  signup_time TEXT NOT NULL DEFAULT (datetime('now')),
  waiting_for TEXT,
  last_cut TEXT,
  in_queue INTEGER NOT NULL DEFAULT 1,
  position_one_start_time TEXT,
  cuts_in_current_wait INTEGER NOT NULL DEFAULT 0,
  current_wait_join_time TEXT,
  accumulated_wait_seconds INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS high_fives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(from_user_id, to_user_id, created_at)
);

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
