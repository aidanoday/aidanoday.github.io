CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  position INTEGER NOT NULL,
  signup_time TEXT NOT NULL DEFAULT (datetime('now')),
  waiting_for TEXT
);

CREATE TABLE IF NOT EXISTS high_fives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(from_user_id, to_user_id, created_at)
);
