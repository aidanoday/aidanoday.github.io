CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  position INTEGER NOT NULL,
  signup_time TEXT NOT NULL DEFAULT (datetime('now'))
);
