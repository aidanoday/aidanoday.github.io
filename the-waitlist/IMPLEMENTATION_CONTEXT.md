# Waitlist Gamification — Implementation Context

This file tracks the in-progress implementation so it can be resumed in a new conversation if needed.

## Feature Description

Adding timer, wait completion, congratulations screen, profile stats, and leaderboards (leaderboard spec was cut off — to be confirmed with user).

### Full feature list:
1. **Countdown timer** on each queue row, left of name. Format: H:MM:SS. **2 minutes** (was 1 hour). Only ticks for the logged-in user at position 1 (active-time only — pauses when not logged in). Others show static full duration.
2. **Timer completion**: position-1 user is removed from queue (account kept), shown CongratulationsScreen.
3. **CongratulationsScreen**: floating circular token "Your Nth wait is over!", stats (high-fives given, high-fives received, total time, cuts made), "Get back on the list" button. Has internal profile sub-screen.
4. **Profile stats section**: total waits completed + history list (ordinal wait + date).
5. **High-fives given tracking**: queue endpoint now returns `hasFivedToday` per user; button stays disabled until UTC midnight.
6. **Leaderboards** — spec was cut off mid-sentence. Needs confirmation from user.

### Data cascade rules:
- User deletes account → `wait_completions`, `high_fives` explicitly deleted, then user deleted
- User removed for bad behavior → same endpoint logic

---

## Current Schema (schema.sql is up to date)

### `users` table columns (all active):
- `id, display_name, password_hash, position, signup_time, waiting_for, last_cut` — original
- `in_queue INTEGER NOT NULL DEFAULT 1` — 0 when user has completed a wait
- `position_one_start_time TEXT` — kept in schema but no longer drives the timer (superseded by `accumulated_wait_seconds`)
- `cuts_in_current_wait INTEGER NOT NULL DEFAULT 0` — reset to 0 on rejoin/completion
- `current_wait_join_time TEXT` — when user joined for current wait cycle
- `accumulated_wait_seconds INTEGER NOT NULL DEFAULT 0` — active time at position 1; only advances via `POST /heartbeat` while user is logged in

### `wait_completions` table:
```sql
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
```

### Migration:
`worker/migration.sql` — run with:
```
npx wrangler d1 execute waitlist-db --remote --file=worker/migration.sql
```
**Note:** Run statements individually if some columns already exist (ALTER TABLE errors if column exists). `last_cut` may already exist in prod.

---

## API (worker/src/index.js) — current state

### Constants:
- `WAIT_DURATION_SECONDS = 120` (2 minutes)

### Endpoints:
| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/signup` | inserts `in_queue=1`, `current_wait_join_time`, `accumulated_wait_seconds=0` |
| `POST` | `/login` | unchanged |
| `GET` | `/queue` | auth-aware: if token present, returns `hasFivedToday` per user; returns `accumulatedWaitSeconds` per user |
| `GET` | `/me` | returns `inQueue` bool; if `!inQueue`, returns `lastCompletion` object for page-reload restore |
| `POST` | `/cut` | cooldown **3 seconds** (was 10s); increments `cuts_in_current_wait`; resets `accumulated_wait_seconds=0` when user reaches pos 1 |
| `PATCH` | `/profile` | unchanged |
| `POST` | `/high-five` | unchanged |
| `DELETE` | `/account` | explicitly deletes `wait_completions` + `high_fives` before deleting user |
| `POST` | `/heartbeat` | increments `accumulated_wait_seconds` by sent `seconds` (capped 1–30); only works when user is at pos 1 |
| `POST` | `/complete-wait` | validates `accumulated_wait_seconds >= WAIT_DURATION_SECONDS - 15`; records completion; removes from queue; resets next person's counter |
| `POST` | `/rejoin` | sets `in_queue=1`, tail position, `accumulated_wait_seconds=0`, `cuts_in_current_wait=0` |
| `GET` | `/wait-history` | returns all `wait_completions` for current user |
| `GET` | `/user/:name` | public profile |

---

## Frontend (App.jsx) — current state

### Constants/helpers:
- `TIMER_DURATION = 120` (seconds)
- `formatDuration(secs)` — e.g. "1m 5s"

### Components:
- `CountdownTimer({ accumulatedWaitSeconds, isPosition1, isSelf, onExpire })` — ticks locally for self at pos 1; syncs to server value on queue refresh; static display for everyone else
- `HighFiveButton({ name, isSelf, highFiveCount, hasFivedToday })` — initialised from server `hasFivedToday`; auto-resets at UTC midnight via `setTimeout`; stays disabled across page reloads
- `QueuePerson` — renders `CountdownTimer` between position number and name; passes `hasFivedToday` to `HighFiveButton`
- `CongratulationsScreen` — floating token, 2×2 stat grid, "Get back on the list" button; internal `screen` state for profile sub-screen
- `ProfileScreen` — Stats section with total waits + history list; fetches `/wait-history` on mount
- `AppBar` — profile menu item only rendered if `onProfile` prop is truthy
- `Dashboard` — heartbeat `useEffect` (every 10s when at pos 1); `handleWaitExpire` calls `/complete-wait`; 3s cut cooldown hardcoded on success
- `App` root — `congratulationsData` state; restores CongratulationsScreen on page reload if `!user.inQueue && user.lastCompletion`

### CSS keyframes added:
- `@keyframes float` — used by the congratulations token

---

## Dev Workflow

```bash
# First time / after schema changes:
npm run worker:local:init    # delete .wrangler/state/v3/d1/ first if re-initing

# Daily dev:
npm run worker:dev:local     # worker at localhost:8787
npm run dev                  # Vite frontend (reads .env.local → VITE_API_URL=http://localhost:8787)
```

- `.env.local` points frontend at local worker (never bundled into prod build)
- `.dev.vars` sets `JWT_SECRET=local-dev-secret` for local worker
- seed.sql: ghostpixel at pos 1 with 59min elapsed; change to test immediate completion

## To Deploy to Production

```bash
npm run worker:deploy
npm run worker:migrate:prod   # applies migration.sql to prod DB — run once
```

---

## Outstanding / To-Do

- [ ] **Leaderboards** — user's message was cut off. Needs spec.
- [ ] Confirm timer duration for production (currently 2 min for testing)
