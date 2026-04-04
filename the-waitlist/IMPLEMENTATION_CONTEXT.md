# Waitlist Gamification — Implementation Context

This file tracks the in-progress implementation so it can be resumed in a new conversation if needed.

## Feature Description

Adding timer, wait completion, congratulations screen, profile stats, and leaderboards (leaderboard spec was cut off — to be confirmed).

### Full feature list:
1. **Countdown timer** on each queue row, left of name. Format: H:MM:SS. Only ticks for position 1. Others show static 1:00:00.
2. **Timer completion** (1 hour): position-1 user is removed from queue (account kept), shown CongratulationsScreen.
3. **CongratulationsScreen**: floating circular token "Your Nth wait is over!", stats (high-fives given, high-fives received, total time, cuts made), "Get back on the list" button.
4. **Profile stats section**: total waits completed + history list (ordinal wait + date).
5. **High-fives given tracking** (previously only received was tracked).
6. **Leaderboards** — spec was cut off mid-sentence. Needs confirmation from user.

### Data cascade rules:
- User deletes account → delete high_fives, wait_completions, then user
- User removed for bad behavior → same (manual DELETE via same endpoint logic)

## Schema Changes

New columns on `users` table:
- `last_cut TEXT` — already existed in prod but not in schema.sql
- `in_queue INTEGER NOT NULL DEFAULT 1` — 0 when user has completed a wait, 1 when active in queue
- `position_one_start_time TEXT` — ISO timestamp of when user reached position 1 (used for timer)
- `cuts_in_current_wait INTEGER NOT NULL DEFAULT 0` — reset to 0 on rejoin
- `current_wait_join_time TEXT` — ISO timestamp of when user joined for current wait cycle (signup or rejoin time)

New table `wait_completions`:
```sql
CREATE TABLE IF NOT EXISTS wait_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  wait_number INTEGER NOT NULL,      -- ordinal: 1st, 2nd, etc.
  joined_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  high_fives_given INTEGER NOT NULL DEFAULT 0,
  high_fives_received INTEGER NOT NULL DEFAULT 0,
  cuts_made INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Migration file: `worker/migration.sql` — run with:
```
npx wrangler d1 execute waitlist-db --file=worker/migration.sql --remote
```
**Note:** Run statements individually if some columns already exist (ALTER TABLE errors if column exists).

## API Changes (worker/src/index.js)

### Constants added:
- `WAIT_DURATION_MS = 60 * 60 * 1000` (1 hour)

### Modified endpoints:
- `GET /queue` — filters `in_queue = 1`, returns `positionOneStartTime` per entry
- `GET /me` — returns `inQueue` bool; if `!inQueue`, also returns `lastCompletion` object
- `POST /signup` — inserts `in_queue=1`, `current_wait_join_time`, `position_one_start_time` (if pos=1)
- `POST /cut` — increments `cuts_in_current_wait`; sets `position_one_start_time` when user reaches pos 1
- `DELETE /account` — now also deletes `wait_completions` and `high_fives` explicitly; sets new pos-1 timer if deleted user was at pos 1
- `getAuthUser` — selects new columns
- `formatUser` — returns `inQueue` field

### New endpoints:
- `POST /complete-wait` — validates timer expired (5s grace), counts HF given/received since `current_wait_join_time`, inserts `wait_completions`, sets `in_queue=0`, shifts queue, sets new pos-1 `position_one_start_time`
- `POST /rejoin` — sets `in_queue=1`, new position at tail, resets `cuts_in_current_wait=0`, sets `current_wait_join_time=now`, sets `position_one_start_time` if becomes pos 1
- `GET /wait-history` — returns all `wait_completions` for current user ordered by wait_number ASC

## Frontend Changes (App.jsx)

### New constants/helpers:
- `TIMER_DURATION = 3600` (seconds)
- `formatDuration(secs)` — returns e.g. "1h 0m 5s"

### New components:
- `CountdownTimer({ positionOneStartTime, isPosition1, isSelf, onExpire })` — shows H:MM:SS; ticks for pos 1 only; calls `onExpire` (once) when hits 0 and `isSelf`
- `CongratulationsScreen({ data, user, onRejoin, onLogout, onUserUpdate, bgRef })` — has internal `screen` state for profile sub-screen; floating token with `@keyframes float`; 2×2 stat grid; "Get back on the list" button

### Modified components:
- `QueuePerson` — add `positionOneStartTime`, `onTimerExpire` props; render `CountdownTimer` between dot and name
- `AppBar` — `onProfile` menu item rendered conditionally (only if prop is truthy)
- `ProfileScreen` — add `waitHistory` state + `useEffect(() => api("/wait-history").then(...))` + Stats section after delete button
- `Dashboard` — add `onWaitComplete` prop; add `handleWaitExpire` (calls `/complete-wait`, then `onWaitComplete(data)`); pass `positionOneStartTime` and `onTimerExpire` to QueuePerson
- `App` root — add `congratulationsData` state; on restore: if `!user.inQueue && user.lastCompletion` → `setCongratulationsData(...)`; add `handleRejoin`; screen priority: `!currentUser` → Auth, `onboarding` → Onboarding, `congratulationsData || !currentUser.inQueue` → Congratulations, else Dashboard

### New CSS keyframe:
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
```

## Progress Tracker

- [x] migration.sql created
- [x] schema.sql updated
- [x] worker/src/index.js rewritten
- [x] App.jsx rewritten
- [ ] Leaderboard spec confirmed with user — message was cut off mid-sentence

## Dev Workflow Added

- `wrangler.toml` now has `[env.dev]` pointing to `waitlist-db-dev` (fill in database_id after `wrangler d1 create waitlist-db-dev`)
- `seed.sql` updated to match new schema; ghostpixel is at pos 1 with 59min elapsed (timer fires in ~1min in dev)
- root `package.json` has new scripts: `worker:dev`, `worker:dev:init`, `worker:dev:migrate`, `worker:local:init`, `worker:local:migrate`, `worker:deploy`, `worker:migrate:prod`

## To Deploy

1. Test locally: `npm run worker:local:init && npm run worker:dev:local`
2. Or test against remote dev DB: create db, fill in wrangler.toml id, `npm run worker:dev:init && npm run worker:dev`
3. Once satisfied: `npm run worker:deploy` then `npm run worker:migrate:prod`
