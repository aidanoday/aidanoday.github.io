-- Dev seed data. Run with: npm run worker:dev:seed
-- Passwords are 'password1' — use the signup endpoint in dev to create real accounts with real hashes.

INSERT OR IGNORE INTO users (display_name, password_hash, position, signup_time, in_queue, current_wait_join_time, position_one_start_time) VALUES
  ('ghostpixel',  'PLACEHOLDER', 1,  datetime('now', '-25 hours'), 1, datetime('now', '-25 hours'), datetime('now', '-59 minutes')),
  ('neondrift',   'PLACEHOLDER', 2,  datetime('now', '-24 hours'), 1, datetime('now', '-24 hours'), NULL),
  ('quietstorm',  'PLACEHOLDER', 3,  datetime('now', '-23 hours'), 1, datetime('now', '-23 hours'), NULL),
  ('velvetbyte',  'PLACEHOLDER', 4,  datetime('now', '-22 hours'), 1, datetime('now', '-22 hours'), NULL),
  ('cosmicdust',  'PLACEHOLDER', 5,  datetime('now', '-21 hours'), 1, datetime('now', '-21 hours'), NULL),
  ('ironpetal',   'PLACEHOLDER', 6,  datetime('now', '-20 hours'), 1, datetime('now', '-20 hours'), NULL),
  ('glitchfawn',  'PLACEHOLDER', 7,  datetime('now', '-19 hours'), 1, datetime('now', '-19 hours'), NULL),
  ('mosscircuit', 'PLACEHOLDER', 8,  datetime('now', '-18 hours'), 1, datetime('now', '-18 hours'), NULL),
  ('lunarthread', 'PLACEHOLDER', 9,  datetime('now', '-17 hours'), 1, datetime('now', '-17 hours'), NULL),
  ('deepcoral',   'PLACEHOLDER', 10, datetime('now', '-16 hours'), 1, datetime('now', '-16 hours'), NULL);

-- ghostpixel is at position 1 with 59 minutes elapsed — timer will expire in ~1 minute in dev
-- (change '-59 minutes' to '-3600 seconds' to test immediate completion)
