// ── Crypto helpers (Web Crypto API) ──────────────────────────────────────

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  salt = salt || crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  const hashArr = Array.from(new Uint8Array(bits));
  const saltArr = Array.from(salt instanceof Uint8Array ? salt : new Uint8Array(salt));
  return saltArr.map(b => b.toString(16).padStart(2, "0")).join("") + ":" + hashArr.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password, stored) {
  const [saltHex] = stored.split(":");
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const result = await hashPassword(password, salt);
  return result === stored;
}

async function createToken(userId, env) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 7 }));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${payload}`));
  const sigStr = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.${sigStr}`;
}

async function verifyToken(token, env) {
  try {
    const [header, payload, sig] = token.split(".");
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sigRestored = sig.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - sig.length % 4) % 4);
    const sigBuf = Uint8Array.from(atob(sigRestored), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBuf, enc.encode(`${header}.${payload}`));
    if (!valid) return null;
    const data = JSON.parse(atob(payload));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Constants ────────────────────────────────────────────────────────────

const WAIT_DURATION_SECONDS = 2 * 60; // 2 minutes (active time only)

// ── Token helpers ────────────────────────────────────────────────────────

function generateInviteToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ── Content moderation ────────────────────────────────────────────────────
// Two-pass filter: word-boundary check on leet-normalized text, then
// collapsed-substring check for unambiguous terms, then grawlix detection.

function _normalizeLeet(text) {
  return text.toLowerCase()
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't')
    .replace(/8/g, 'b').replace(/@/g, 'a').replace(/\$/g, 's')
    .replace(/!/g, 'i').replace(/\|/g, 'i').replace(/\+/g, 't');
}

// Checked with \b word boundaries on normalized text (guards against substring false-positives)
const BANNED_WORDS = [
  // Profanity
  'fuck', 'fucker', 'fucked', 'fucking', 'fucks',
  'shit', 'shits', 'shitting', 'bullshit',
  'cunt', 'cunts',
  'cock', 'cocks',
  'dick', 'dicks',
  'pussy', 'pussies',
  'bitch', 'bitches', 'bitching',
  'whore', 'whores',
  'slut', 'sluts',
  'ass', 'asses', 'asshole', 'assholes',
  'arse', 'arsehole',
  'bastard', 'bastards',
  'wanker', 'wankers', 'wank',
  'prick', 'pricks',
  'twat', 'twats',
  'douchebag', 'douche',
  'dipshit', 'jackass', 'shitstain',
  'bollocks', 'bellend',
  'motherfucker', 'motherfucking',
  // Sexual
  'porn', 'porno',
  'dildo', 'dildos',
  'blowjob', 'handjob', 'rimjob',
  'masturbate', 'masturbating', 'masturbation',
  'ejaculate', 'ejaculation',
  'jizz', 'cum', 'cumshot',
  'erection',
  'pawg','csam',
  // Discriminatory / slurs
  'nigger', 'niggers', 'nigga', 'niggas','nig','nigglet',
  'chink', 'chinks',
  'spic', 'spics',
  'wetback', 'wetbacks',
  'kike', 'kikes',
  'gook', 'gooks',
  'faggot', 'faggots',
  'fag', 'fags',
  'retard', 'retards', 'retarded',
  'tranny', 'trannies',
  'dyke', 'dykes',
  'cracker', 'crackers',
  'beaner', 'beaners',
  'towelhead', 'raghead',
  'honky', 'honkies',
  // Severe
  'pedophile', 'pedophiles', 'paedophile',
  'pedo',
  'molest', 'molester',
];

// Checked as substrings on the collapsed (all-non-alpha stripped) normalized text.
// Only terms safe against false-positive substring collisions go here.
const BANNED_SUBSTRINGS = [
  'fuck', 'cunt', 'nigger', 'nigga', 'twat', 'wanker', 'jizz',
  'blowjob', 'handjob', 'rimjob', 'faggot', 'pedophil', 'paedophil',
  'molest', 'wetback', 'kike', 'chink', 'spic',
];

// Grawlix: 3+ consecutive punctuation symbols used to mask profanity
const GRAWLIX_RE = /[@#$%!&*]{3,}/;

function checkContent(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (GRAWLIX_RE.test(trimmed)) return true;

  const normed = _normalizeLeet(trimmed);

  // Pass 1: word-boundary check
  for (const word of BANNED_WORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(normed)) return true;
  }

  // Pass 2: collapsed substring check (catches spaced-out / punctuation-separated variants)
  const collapsed = normed.replace(/[^a-z]/g, '');
  for (const sub of BANNED_SUBSTRINGS) {
    if (collapsed.includes(sub)) return true;
  }

  return false;
}

// ── Response helpers ─────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function cors(response, origin) {
  const allowed = ["https://www.aidanoday.me", "https://aidanoday.me", "https://aidanoday.github.io", "http://localhost:5173", "http://localhost:4173"];
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0];
  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// ── Auth middleware ──────────────────────────────────────────────────────

async function getAuthUser(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const payload = await verifyToken(auth.slice(7), env);
  if (!payload) return null;
  return await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue, accumulated_wait_seconds, cuts_in_current_wait, current_wait_join_time, invite_token FROM users WHERE id = ?"
  ).bind(payload.sub).first();
}

// ── Formatters ───────────────────────────────────────────────────────────

function formatUser(row) {
  const inQueue = row.in_queue === 1 || row.in_queue === true;
  return {
    displayName: row.display_name,
    position: inQueue ? row.position : null,
    signupTime: row.signup_time,
    waitingFor: row.waiting_for || null,
    inQueue,
  };
}

// ── Routes ───────────────────────────────────────────────────────────────

async function handleSignup(request, env) {
  const { displayName, password, referrer } = await request.json();

  if (!displayName?.trim() || !password) {
    return json({ error: "All fields are required." }, 400);
  }
  if (password.length < 4) {
    return json({ error: "Password must be at least 4 characters." }, 400);
  }

  if (checkContent(displayName.trim())) {
    return json({ error: "That username isn't allowed. Please choose another." }, 422);
  }

  const existingName = await env.DB.prepare(
    "SELECT id FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName.trim()).first();
  if (existingName) return json({ error: "This display name is taken." }, 409);

  const now = new Date().toISOString();
  let position;

  // If a referrer token was supplied, insert the new user directly behind them.
  if (referrer?.trim()) {
    const referrerUser = await env.DB.prepare(
      "SELECT id, position FROM users WHERE invite_token = ? AND in_queue = 1"
    ).bind(referrer.trim()).first();

    if (referrerUser) {
      // Shift everyone currently behind the referrer down one spot.
      await env.DB.prepare(
        "UPDATE users SET position = position + 1 WHERE in_queue = 1 AND position > ?"
      ).bind(referrerUser.position).run();
      position = referrerUser.position + 1;
    }
  }

  // Fall back to end of queue if no valid referrer.
  if (!position) {
    const { max_pos } = await env.DB.prepare(
      "SELECT COALESCE(MAX(position), 0) as max_pos FROM users WHERE in_queue = 1"
    ).first();
    position = max_pos + 1;
  }

  const positionOneStartTime = position === 1 ? now : null;

  const passwordHash = await hashPassword(password);
  const inviteToken = generateInviteToken();

  await env.DB.prepare(
    "INSERT INTO users (display_name, password_hash, position, signup_time, in_queue, current_wait_join_time, position_one_start_time, invite_token) VALUES (?, ?, ?, ?, 1, ?, ?, ?)"
  ).bind(displayName.trim(), passwordHash, position, now, now, positionOneStartTime, inviteToken).run();

  const user = await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName.trim()).first();
  const token = await createToken(user.id, env);

  return json({ user: formatUser(user), token });
}

async function handleLogin(request, env) {
  const { displayName, password } = await request.json();

  if (!displayName?.trim() || !password) {
    return json({ error: "Display name and password are required." }, 400);
  }

  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName.trim()).first();
  if (!user) return json({ error: "Invalid display name or password." }, 401);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return json({ error: "Invalid display name or password." }, 401);

  const token = await createToken(user.id, env);
  return json({ user: formatUser(user), token });
}

async function handleQueue(request, env) {
  // Identify the requesting user (if logged in) to flag who they've already fived this run
  let myId = null;
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const payload = await verifyToken(auth.slice(7), env);
    if (payload) myId = payload.sub;
  }

  let fivedThisRunIds = new Set();
  if (myId) {
    const myUser = await env.DB.prepare(
      "SELECT current_wait_join_time, signup_time FROM users WHERE id = ?"
    ).bind(myId).first();
    const joinTime = myUser?.current_wait_join_time || myUser?.signup_time;
    if (joinTime) {
      const todayUtc = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
      const sinceTime = joinTime > todayUtc ? joinTime : todayUtc;
      const { results: fiveRows } = await env.DB.prepare(
        "SELECT to_user_id FROM high_fives WHERE from_user_id = ? AND created_at >= ?"
      ).bind(myId, sinceTime).all();
      fivedThisRunIds = new Set(fiveRows.map(r => r.to_user_id));
    }
  }

  const { results } = await env.DB.prepare(`
    SELECT u.id, u.display_name, u.position, u.waiting_for, u.accumulated_wait_seconds, u.last_heartbeat,
      (SELECT COUNT(*) FROM high_fives hf WHERE hf.to_user_id = u.id AND hf.created_at >= COALESCE(u.current_wait_join_time, u.signup_time)) as high_five_count
    FROM users u WHERE u.in_queue = 1 ORDER BY u.position ASC
  `).all();

  return json(results.map(r => ({
    displayName: r.display_name,
    position: r.position,
    waitingFor: r.waiting_for || null,
    highFiveCount: r.high_five_count || 0,
    accumulatedWaitSeconds: r.accumulated_wait_seconds || 0,
    lastHeartbeat: r.last_heartbeat || null,
    hasFivedToday: fivedThisRunIds.has(r.id),
  })));
}

async function handleMe(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const result = { ...formatUser(user), inviteToken: user.invite_token || null };

  // If the user is not in queue, attach their last wait completion so the
  // frontend can show the CongratulationsScreen on page reload.
  if (!result.inQueue) {
    const lastComp = await env.DB.prepare(
      "SELECT * FROM wait_completions WHERE user_id = ? ORDER BY wait_number DESC LIMIT 1"
    ).bind(user.id).first();
    if (lastComp) {
      result.lastCompletion = {
        waitNumber: lastComp.wait_number,
        highFivesGiven: lastComp.high_fives_given,
        highFivesReceived: lastComp.high_fives_received,
        cutsMade: lastComp.cuts_made,
        totalTimeSeconds: Math.round(
          (new Date(lastComp.completed_at) - new Date(lastComp.joined_at)) / 1000
        ),
      };
    }
  }

  return json(result);
}

async function handleHighFive(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const { displayName } = await request.json();
  if (!displayName) return json({ error: "displayName required" }, 400);

  const target = await env.DB.prepare(
    "SELECT id FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName).first();
  if (!target) return json({ error: "User not found" }, 404);
  if (target.id === user.id) return json({ error: "You can't high-five yourself!" }, 400);

  const joinTime = user.current_wait_join_time || user.signup_time;
  const todayUtc = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
  const sinceTime = joinTime > todayUtc ? joinTime : todayUtc;
  const existing = await env.DB.prepare(
    "SELECT id FROM high_fives WHERE from_user_id = ? AND to_user_id = ? AND created_at >= ?"
  ).bind(user.id, target.id, sinceTime).first();
  if (existing) return json({ error: "You already high-fived this person today!" }, 429);

  await env.DB.prepare(
    "INSERT INTO high_fives (from_user_id, to_user_id, created_at) VALUES (?, ?, ?)"
  ).bind(user.id, target.id, new Date().toISOString()).run();

  const { count } = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM high_fives WHERE to_user_id = ?"
  ).bind(target.id).first();
  return json({ highFiveCount: count });
}

async function handleUserProfile(env, displayName) {
  const user = await env.DB.prepare(
    "SELECT display_name, position, signup_time, waiting_for, in_queue FROM users WHERE lower(display_name) = lower(?)"
  ).bind(displayName).first();
  if (!user) return json({ error: "User not found" }, 404);
  const { count } = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM high_fives WHERE to_user_id = (SELECT id FROM users WHERE lower(display_name) = lower(?))"
  ).bind(displayName).first();
  return json({
    displayName: user.display_name,
    position: user.in_queue === 1 ? user.position : null,
    signupTime: user.signup_time,
    waitingFor: user.waiting_for || null,
    highFiveCount: count || 0,
    inQueue: user.in_queue === 1,
  });
}

async function handleCut(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!user.in_queue) return json({ error: "You're not in the queue." }, 400);
  if (user.position <= 1) return json({ error: "You're already first in line." }, 400);

  // Check cut cooldown (3 seconds)
  const lastCutRow = await env.DB.prepare(
    "SELECT last_cut FROM users WHERE id = ?"
  ).bind(user.id).first();
  if (lastCutRow?.last_cut) {
    const elapsed = Date.now() - new Date(lastCutRow.last_cut).getTime();
    if (elapsed < 3000) {
      const remaining = Math.ceil((3000 - elapsed) / 1000);
      return json({ error: `Wait ${remaining}s before cutting again.`, cooldown: remaining }, 429);
    }
  }

  const ahead = await env.DB.prepare(
    "SELECT id FROM users WHERE in_queue = 1 AND position = ?"
  ).bind(user.position - 1).first();
  if (!ahead) return json({ error: "No one ahead to cut." }, 400);

  const now = new Date().toISOString();
  const willBePosition1 = (user.position - 1) === 1;

  const batch = [
    env.DB.prepare(
      "UPDATE users SET position = ?, last_cut = ?, cuts_in_current_wait = cuts_in_current_wait + 1 WHERE id = ?"
    ).bind(user.position - 1, now, user.id),
    env.DB.prepare(
      "UPDATE users SET position = ? WHERE id = ?"
    ).bind(user.position, ahead.id),
  ];

  // When reaching position 1 by cutting, reset the active-time counter
  if (willBePosition1) {
    batch.push(
      env.DB.prepare(
        "UPDATE users SET accumulated_wait_seconds = 0 WHERE id = ?"
      ).bind(user.id)
    );
  }

  await env.DB.batch(batch);

  const updated = await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue FROM users WHERE id = ?"
  ).bind(user.id).first();
  return json({ user: formatUser(updated) });
}

async function handleProfileUpdate(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const { waitingFor } = await request.json();
  const value = typeof waitingFor === "string" ? waitingFor.trim().slice(0, 200) : null;

  if (value && checkContent(value)) {
    return json({ error: "Your response contains inappropriate language." }, 422);
  }

  await env.DB.prepare(
    "UPDATE users SET waiting_for = ? WHERE id = ?"
  ).bind(value, user.id).run();
  const updated = await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue FROM users WHERE id = ?"
  ).bind(user.id).first();
  return json(formatUser(updated));
}

async function handleDeleteAccount(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const isInQueue = user.in_queue === 1;
  const wasPosition1 = isInQueue && user.position === 1;

  // Find who becomes position 1 if the deleted user held that spot
  const nextInLine = wasPosition1
    ? await env.DB.prepare(
        "SELECT id FROM users WHERE in_queue = 1 AND position = 2"
      ).first()
    : null;

  const now = new Date().toISOString();

  // Explicitly clean up related data then delete the user
  const batch = [
    env.DB.prepare("DELETE FROM wait_completions WHERE user_id = ?").bind(user.id),
    env.DB.prepare("DELETE FROM high_fives WHERE from_user_id = ? OR to_user_id = ?").bind(user.id, user.id),
  ];
  if (isInQueue) {
    batch.push(
      env.DB.prepare(
        "UPDATE users SET position = position - 1 WHERE in_queue = 1 AND position > ?"
      ).bind(user.position)
    );
  }
  batch.push(env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id));

  await env.DB.batch(batch);

  if (nextInLine?.id) {
    await env.DB.prepare(
      "UPDATE users SET position_one_start_time = ? WHERE id = ?"
    ).bind(now, nextInLine.id).run();
  }

  return json({ ok: true });
}

async function handleCompleteWait(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  if (user.in_queue !== 1 || user.position !== 1) {
    return json({ error: "You're not first in line." }, 400);
  }

  // Validate the active-time counter has reached the required duration.
  // Fall back to wall-clock time since joining if heartbeats failed to land
  // (e.g. browser throttled the tab or the heartbeat interval was reset too often).
  const accumulated = user.accumulated_wait_seconds || 0;
  const joinedAt = user.current_wait_join_time || user.signup_time;
  const wallClockElapsed = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 1000);
  const effectiveAccumulated = Math.max(accumulated, wallClockElapsed);
  if (effectiveAccumulated < WAIT_DURATION_SECONDS - 15) {
    const remaining = WAIT_DURATION_SECONDS - effectiveAccumulated;
    return json({ error: `Timer not complete. ${remaining}s of active time remaining.` }, 400);
  }

  const completedAt = new Date().toISOString();

  // Count high-fives given and received during this wait cycle
  const givenRes = await env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM high_fives WHERE from_user_id = ? AND created_at >= ?"
  ).bind(user.id, joinedAt).first();

  const receivedRes = await env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM high_fives WHERE to_user_id = ? AND created_at >= ?"
  ).bind(user.id, joinedAt).first();

  // Ordinal wait number
  const cntRes = await env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM wait_completions WHERE user_id = ?"
  ).bind(user.id).first();

  const given = givenRes?.cnt || 0;
  const received = receivedRes?.cnt || 0;
  const waitNumber = (cntRes?.cnt || 0) + 1;
  const totalTimeSeconds = Math.round((Date.now() - new Date(joinedAt).getTime()) / 1000);
  const cuts = user.cuts_in_current_wait || 0;

  // Record the completion. Try with waiting_for first; fall back if the column
  // wasn't added to an older production DB via migration.
  try {
    await env.DB.prepare(
      "INSERT INTO wait_completions (user_id, wait_number, joined_at, completed_at, high_fives_given, high_fives_received, cuts_made, waiting_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(user.id, waitNumber, joinedAt, completedAt, given, received, cuts, user.waiting_for || null).run();
  } catch {
    await env.DB.prepare(
      "INSERT INTO wait_completions (user_id, wait_number, joined_at, completed_at, high_fives_given, high_fives_received, cuts_made) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(user.id, waitNumber, joinedAt, completedAt, given, received, cuts).run();
  }

  // Find who is next in line before we shift positions
  const nextPerson = await env.DB.prepare(
    "SELECT id FROM users WHERE in_queue = 1 AND position = 2"
  ).first();

  // Remove user from queue and close the gap
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE users SET in_queue = 0, cuts_in_current_wait = 0, accumulated_wait_seconds = 0 WHERE id = ?"
    ).bind(user.id),
    env.DB.prepare(
      "UPDATE users SET position = position - 1 WHERE in_queue = 1 AND position > 1"
    ),
  ]);

  // Reset the new position-1 person's active-time counter so they start fresh
  if (nextPerson?.id) {
    await env.DB.prepare(
      "UPDATE users SET accumulated_wait_seconds = 0 WHERE id = ?"
    ).bind(nextPerson.id).run();
  }

  return json({ waitNumber, highFivesGiven: given, highFivesReceived: received, totalTimeSeconds, cutsMade: cuts, waitingFor: user.waiting_for || null });
}

async function handleRejoin(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.in_queue === 1) return json({ error: "You're already in the queue." }, 400);

  const { max_pos } = await env.DB.prepare(
    "SELECT COALESCE(MAX(position), 0) as max_pos FROM users WHERE in_queue = 1"
  ).first();

  const now = new Date().toISOString();
  const newPos = max_pos + 1;

  await env.DB.prepare(
    "UPDATE users SET in_queue = 1, position = ?, cuts_in_current_wait = 0, accumulated_wait_seconds = 0, current_wait_join_time = ? WHERE id = ?"
  ).bind(newPos, now, user.id).run();

  const updated = await env.DB.prepare(
    "SELECT id, display_name, position, signup_time, waiting_for, in_queue FROM users WHERE id = ?"
  ).bind(user.id).first();
  return json({ user: formatUser(updated) });
}

async function handleLeaderboards(env) {
  const [givenRes, receivedRes, runsRes, givenCumRes, receivedCumRes] = await env.DB.batch([
    env.DB.prepare(`
      SELECT u.display_name, wc.high_fives_given as value, wc.wait_number
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      ORDER BY wc.high_fives_given DESC, wc.id ASC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT u.display_name, wc.high_fives_received as value, wc.wait_number
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      ORDER BY wc.high_fives_received DESC, wc.id ASC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT u.display_name, COUNT(*) as value
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      GROUP BY wc.user_id ORDER BY value DESC, u.display_name ASC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT u.display_name, SUM(wc.high_fives_given) as value
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      GROUP BY wc.user_id ORDER BY value DESC, u.display_name ASC LIMIT 10
    `),
    env.DB.prepare(`
      SELECT u.display_name, SUM(wc.high_fives_received) as value
      FROM wait_completions wc JOIN users u ON u.id = wc.user_id
      GROUP BY wc.user_id ORDER BY value DESC, u.display_name ASC LIMIT 10
    `),
  ]);

  const fmt = (r, withWait) => ({
    displayName: r.display_name,
    value: r.value,
    ...(withWait && { waitNumber: r.wait_number }),
  });

  return json({
    highFivesGiven: givenRes.results.map(r => fmt(r, true)),
    highFivesReceived: receivedRes.results.map(r => fmt(r, true)),
    runsCompleted: runsRes.results.map(r => fmt(r, false)),
    highFivesGivenCumulative: givenCumRes.results.map(r => fmt(r, false)),
    highFivesReceivedCumulative: receivedCumRes.results.map(r => fmt(r, false)),
  });
}

async function handleReferrer(request, env) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return json({ error: "token required" }, 400);
  const row = await env.DB.prepare(
    "SELECT display_name FROM users WHERE invite_token = ?"
  ).bind(token).first();
  if (!row) return json({ error: "Not found" }, 404);
  return json({ displayName: row.display_name });
}

async function handleHeartbeat(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  // Silently ignore if user isn't the active position-1 person
  if (user.in_queue !== 1 || user.position !== 1) return json({ ok: true });

  const { seconds } = await request.json();
  // Cap each heartbeat at 30s to limit any abuse
  const delta = Math.min(Math.max(1, seconds || 10), 30);

  const now = new Date().toISOString();
  await env.DB.prepare(
    "UPDATE users SET accumulated_wait_seconds = MIN(accumulated_wait_seconds + ?, ?), last_heartbeat = ? WHERE id = ?"
  ).bind(delta, WAIT_DURATION_SECONDS, now, user.id).run();

  const updated = await env.DB.prepare(
    "SELECT accumulated_wait_seconds FROM users WHERE id = ?"
  ).bind(user.id).first();

  return json({ ok: true, accumulatedWaitSeconds: updated?.accumulated_wait_seconds || 0 });
}

async function handleWaitHistory(request, env) {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const { results } = await env.DB.prepare(
    "SELECT wait_number, joined_at, completed_at, high_fives_given, high_fives_received, cuts_made, waiting_for FROM wait_completions WHERE user_id = ? ORDER BY wait_number ASC"
  ).bind(user.id).all();

  return json(results.map(r => ({
    waitNumber: r.wait_number,
    joinedAt: r.joined_at,
    completedAt: r.completed_at,
    highFivesGiven: r.high_fives_given,
    highFivesReceived: r.high_fives_received,
    cutsMade: r.cuts_made,
    waitingFor: r.waiting_for || null,
    totalTimeSeconds: Math.round((new Date(r.completed_at) - new Date(r.joined_at)) / 1000),
  })));
}

// ── Main handler ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }), origin);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    let response;
    try {
      if (path === "/signup" && request.method === "POST") {
        response = await handleSignup(request, env);
      } else if (path === "/login" && request.method === "POST") {
        response = await handleLogin(request, env);
      } else if (path === "/queue" && request.method === "GET") {
        response = await handleQueue(request, env);
      } else if (path === "/me" && request.method === "GET") {
        response = await handleMe(request, env);
      } else if (path === "/cut" && request.method === "POST") {
        response = await handleCut(request, env);
      } else if (path === "/profile" && request.method === "PATCH") {
        response = await handleProfileUpdate(request, env);
      } else if (path === "/high-five" && request.method === "POST") {
        response = await handleHighFive(request, env);
      } else if (path === "/account" && request.method === "DELETE") {
        response = await handleDeleteAccount(request, env);
      } else if (path === "/leaderboards" && request.method === "GET") {
        response = await handleLeaderboards(env);
      } else if (path === "/heartbeat" && request.method === "POST") {
        response = await handleHeartbeat(request, env);
      } else if (path === "/complete-wait" && request.method === "POST") {
        response = await handleCompleteWait(request, env);
      } else if (path === "/rejoin" && request.method === "POST") {
        response = await handleRejoin(request, env);
      } else if (path === "/wait-history" && request.method === "GET") {
        response = await handleWaitHistory(request, env);
      } else if (path === "/referrer" && request.method === "GET") {
        response = await handleReferrer(request, env);
      } else if (path.startsWith("/user/") && request.method === "GET") {
        response = await handleUserProfile(env, decodeURIComponent(path.slice(6)));
      } else {
        response = json({ error: "Not found" }, 404);
      }
    } catch (err) {
      response = json({ error: "Internal server error" }, 500);
    }

    return cors(response, origin);
  },
};
